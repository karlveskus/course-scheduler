import React, {Component} from 'react';

import CourseSearchTable from "client/components/CourseSearchTable/CourseSearchTable";
import SearchBox from '../../../../components/SearchBox/SearchBox';
import Button from "client/components/Button/Button";
import Tabs from "../../../../components/Tabs/Tabs";
import DetailedSearchArea from "client/containers/MainContainer/ContentWrapper/SearchArea/DetailedSearchArea/DetailedSearchArea"
import DropdownSelectBox from "../../../../components/DropdownSelectBox/DropdownSelectBox";

import * as CourseSearchAction from 'client/actions/CourseSearchAction';
import * as CourseDraftAction from 'client/actions/CourseDraftAction';
import * as RegisteredCoursesAction from 'client/actions/RegisteredCoursesAction';
import CourseSearchStore from 'client/stores/CourseSearchStore';
import CourseDraftStore from 'client/stores/CourseDraftStore';
import RegisteredCoursesStore from 'client/stores/RegisteredCoursesStore';

import './search-area.scss';

class SearchArea extends Component {

    constructor(props) {
        super(props);
        this.addEventListenerToWindow();

        this.state = {
            draftedCourses: CourseDraftStore.getAll(),
            registeredCourses: RegisteredCoursesStore.getAll(),
            courses: CourseSearchStore.getAll(),
            inputPlaceholder: "Search course name, code, institute etc...",
            query: '',
            filters: {
                all: "All",
                obligatory: "Obligatory courses",
                //isiklik: "Personal", TODO left out for demo resons
                elective: "Elective courses",
            },
            initialFilter: "all",
            selectedCourses: [],
            selectedGroups: {}
        };
    }

    componentWillMount() {
        CourseSearchStore.on("change", () => {
            this.setState({
                courses: CourseSearchStore.getAll(),
            })
        });
        CourseDraftStore.on("change", () => {
            this.setState({
                draftedCourses: CourseDraftStore.getAll(),
            })
        });
        RegisteredCoursesStore.on("change", () => {
            this.setState({
                registeredCourses: RegisteredCoursesStore.getAll(),
            })
        })
    }

    getSearchResultArea() {
        let searchResultArea = null;
        if (this.state.courses.length > 0) {
            searchResultArea =
                <div className="search-result">
                    <div className="result-table">
                        <CourseSearchTable changeHandler={this.toggleCourse.bind(this)}
                                           courses={this.state.courses}
                                           disabledCoursesIds={this.getDisabledCoursesIds()} />
                    </div>
                    <div className="buttons-area">
                        <Button clickHandler={this.openGroupSelectModal.bind(this)}
                                class="big blue" name="Register to chosen courses" />
                        <Button clickHandler={this.addToDraft.bind(this)}
                                class="big green" name="Add to draft" />
                    </div>
                </div>
        }
        return searchResultArea;
    }

    updateQuery(e) {
        this.setState({query: e.target.value});
    }

    updateSearchResult() {
        CourseSearchAction.searchCourses(this.state.query);
    }

    clearSearchResult() {
        this.setState({query: ""});
        CourseSearchAction.clearSearchResult();
    }

    filterChangeHandler(tab) {
        this.clearSearchResult();
        CourseSearchAction.changeCoursesSearchFilter(tab);

        if (tab === "all") {
            this.setState({inputPlaceholder: "Search course name, code, institute etc..."});
        } else {
            this.setState({inputPlaceholder: "Filter results..."});
            CourseSearchAction.searchCourses(this.state.query);
        }
    }

    keyPressHandler(e) {
        if (e.key === 'Enter') {
            this.updateSearchResult();
        }
    }

    toggleCourse(course) {
        let courses = this.state.selectedCourses;

        if (courses.includes(course)) {
            courses = courses.filter(el => el !== course);
        } else {
            courses.push(course);
        }
        this.setState({selectedCourses: courses});
    }

    addToDraft() {
        let courses = this.state.selectedCourses.map((course) => {return {'course': course}});

        CourseDraftAction.addToDraft(courses);
        this.setState({
            draftedCourses: CourseDraftStore.getAll(),
            selectedCourses: []
        });
    }

    addToRegisteredCourses() {
        if (Object.keys(this.state.selectedGroups).length === this.state.selectedCourses.length) {
            let courses = this.state.selectedCourses.map((course) => {
                return {
                    'course': course,
                    'groupId': this.state.selectedGroups[course.id].id
                }
            });

            RegisteredCoursesAction.addToRegisteredCourses(courses);
            this.setState({
                registeredCourses: RegisteredCoursesStore.getAll(),
                selectedCourses: []
            });

            this.closeGroupSelectModal();
        }
    }

    getDisabledCoursesIds() {
        return this.state.registeredCourses.map((registeredCourse) => registeredCourse.course.id)
            .concat(this.state.draftedCourses.map((draftedCourse) => draftedCourse.course.id));
    }

    setCourseGroups(selection) {
        console.log(selection);

        let selectedGroups = this.state.selectedGroups;

        selectedGroups[selection.id] = selection.selectedEl;

        this.setState({selectedGroups});
    }

    closeGroupSelectModal() {
        let modal = document.getElementById('group-search-modal');
        modal.style.display = "none";
    }

    openGroupSelectModal() {
        let modal = document.getElementById('group-search-modal');
        modal.style.display = "block";
    }

    addEventListenerToWindow() {
        window.addEventListener('click', (e) => {
            let modal = document.getElementById('group-search-modal');

            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }
    
    getPracticeGroupsFromCourse(course) {
        return course.occurrences
            .filter((course) => course.type === "practice")
            .map((occurrence) => {
                return {
                    id: occurrence.group.id,
                    label_eng: occurrence.group.name
                }
            });
    }

    render() {
          return (
            <div className="search-area">

                <div id="group-search-modal" className="group-search-modal">
                    <div className="group-search-modal-content">
                        <h3>Choose group</h3>
                        <span onClick={this.closeGroupSelectModal} className="close">&times;</span>
                        {
                            this.state.selectedCourses.map((selectedCourse) =>
                                <DropdownSelectBox key={selectedCourse.id} id={selectedCourse.id} label={selectedCourse.name_eng} className="full-width"
                                                   values={this.getPracticeGroupsFromCourse(selectedCourse)}
                                                   clickHandler={this.setCourseGroups.bind(this)} />
                            )
                        }

                        <Button class="big green" name="Register" clickHandler={this.addToRegisteredCourses.bind(this)}/>
                    </div>
                </div>

                <h2>Add courses</h2>
                <hr />
                <SearchBox changeHandler={this.updateQuery.bind(this)}
                           keyPressHandler={this.keyPressHandler.bind(this)}
                           placeholder={this.state.inputPlaceholder}
                           class="mainSearchBox"
                           value={this.state.query} />

                <Tabs tabs={this.state.filters} activeTab={this.state.initialFilter}
                      changeTabHandler={this.filterChangeHandler.bind(this)} />

                <div className="search-button">
                    <Button class="big blue" name="Search" clickHandler={this.updateSearchResult.bind(this)}/>
                </div>

                <DetailedSearchArea/>

                {this.getSearchResultArea()}

            </div>
        )
    }
}

export default SearchArea;
import React, {Component} from 'react';
import _ from 'underscore';

import * as CourseDraftAction from 'client/actions/CourseDraftAction';
import CheckBox from "client/components/CheckBox/CheckBox";
import ScheduleBar from "client/components/ScheduleBar/ScheduleBar";
import Button from 'client/components/Button/Button';

import 'client/components/SmartGroupSelector/smart-group-selector.scss';

class SmartGroupSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedGroups: [],
        }
    }

    parseTimeFromOccurrence(occurrence) {
        const times = occurrence.map((occurrence) => occurrence.time);

        const groups = _.groupBy(_.flatten(times), (value) => {
            return value.day + '#' + value.start_time + '#' + value.end_time;
        });

        const occurrences = _.map(groups, (group) => {
            return {
                day: group[0].day,
                start_time: group[0].start_time,
                end_time: group[0].end_time,
                weeks: _.pluck(group, 'week')
            }
        });

        return occurrences;
    };

    parseTimeFromPracticalOccurrences(occurences) {
        const groups = _.groupBy(occurences, (value) => {
            return value.group.id + '#' + value.group.name;
        });

        const occurrences = _.map(groups, (group) => {
            return {
                group: group[0].group,
                regAttendants: group[0].registered_attendants,
                maxAttendants: group[0].limit_of_attendants,
                places: _.pluck(group, 'place'),
                lecturers: _.pluck(group[0].lecturers, 'name'),
                occurrences: this.parseTimeFromOccurrence(group)
            }
        });

        return occurrences
    }

    checkBoxHandler(groupId) {
        let groupIds = this.state.selectedGroups;

        if (groupIds.includes(groupId)) {
            groupIds = groupIds.filter(el => el !== groupId);
        } else {
            groupIds.push(groupId);
        }
        this.setState({selectedGroups: groupIds});
    }

    lockGroups() {
        const courseId = this.props.course.course.id;
        const selectedGroups = this.state.selectedGroups;

        CourseDraftAction.setLockedGroups(courseId, selectedGroups);
        this.setState({selectedGroups: []})
    }

    practicalsGroupsTable(practicals) {

        if (!practicals) return null;

        return (
            <div>
                <label>Practice sessions:</label>
                <table className="pracicals-table">
                    <thead>
                    <tr>
                        <th></th>
                        <th>Group</th>
                        <th>Time</th>
                        <th>Place</th>
                        <th>Reg. persons</th>
                        <th>Lecturers</th>
                    </tr>
                    </thead>
                    <tbody>
                    {practicals.map((p) =>
                        <tr key={p.group.id}>
                            <td><CheckBox changeHandler={this.checkBoxHandler.bind(this)} value={p.group.id} classes="small green" /></td>
                            <td>{p.group.name}</td>
                            <td><ScheduleBar occurrences={p.occurrences} class="narrow" /></td>
                            <td>{p.places.join(", ")}</td>
                            <td>{p.regAttendants + "/" + p.maxAttendants}</td>
                            <td>{p.lecturers.join(", ")}</td>
                        </tr>)
                    }
                    </tbody>
                </table>
            </div>
        )
    }

    makeChild(draftedCourse) {
        console.log('Render model for ' + draftedCourse.course.name_est)

        let lectureOccurrences, practicalOccurrences;

        const occurrences = _.groupBy(draftedCourse.course.occurrences, 'type');

        // console.log(occurrences)

        if (occurrences.lecture) {
            lectureOccurrences = this.parseTimeFromOccurrence(occurrences.lecture);
        }

        if (occurrences.practice) {
            practicalOccurrences = this.parseTimeFromPracticalOccurrences(occurrences.practice);
        }

        // console.log(lectureOccurrences);
        // console.log(practicalOccurrences);

        const practicalsGroupsTable = this.practicalsGroupsTable(practicalOccurrences);

        return (
            <div>
                <label>Lecture:</label><ScheduleBar occurrences={lectureOccurrences} class="wide" />
                {practicalsGroupsTable}
                <div className="lock-group-button">
                    <Button clickHandler={this.lockGroups.bind(this)} class="green big" name="Lock groups"/>
                </div>
            </div>
        )
    }

    render() {
        return <div>{this.makeChild(this.props.course)}</div>
    }
}

export default SmartGroupSelector;
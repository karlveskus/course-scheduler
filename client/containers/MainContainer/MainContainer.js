import React, { Component } from 'react';

import Header from './Header/Header'
import ContentWrapper from './ContentWrapper/ContentWrapper'

import 'client/containers/MainContainer/main-container.scss';

class MainContainer extends Component {
    render() {
        return (
            <div className="mainContainer">
                <Header/>
                <ContentWrapper />
            </div>
        )
    }
}

export default MainContainer;
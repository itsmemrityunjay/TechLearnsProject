import React from 'react'
import Header from './components/Header'
import SearchCourse from './components/SearchCourse'
import SkillIndiaCourses from './components/SkillIndiaCourses'
import ElementryCourse from './components/ElementryCourse'
import UnderGraduateCourses from './components/UnderGraduateCourses'

const index = () => {
    return (
        <div>
            <Header />
            <SearchCourse />
            <SkillIndiaCourses />
            <ElementryCourse />
            <UnderGraduateCourses />

        </div>
    )
}

export default index
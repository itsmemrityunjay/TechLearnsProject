import React from 'react'
import Header from './components/Header'
import Benifit from './components/Benifit'
import OurCompetitions from './components/OurCompetitions'
import OtherCompetitions from './components/OtherCompetitions'
import PastCompetitions from './components/PastCompetitions'
import ReusableCTA from '../../utils/ReusableCTA'

const index = () => {
    return (
        <div>
            <Header />
            <Benifit />
            <OurCompetitions />
            <OtherCompetitions />
            <PastCompetitions />

            {/* <ReusableCTA
                title="Discover Our Competitions"
                description="Challenge yourself with our coding competitions and win exciting prizes."
                buttonText="Browse Competitions"
                redirectTo="/competitions"
                iconType="competition"
                variant="primary"
            /> */}


            <ReusableCTA
                title="Upgrade Your Skills"
                description="Explore our wide range of courses designed for all skill levels."
                buttonText="Explore Courses"
                redirectTo="/courses"
                variant="secondary"
                iconType="course"
            />


            {/* <ReusableCTA
                title="Join The Discussion"
                description="Connect with peers and experts to solve your coding challenges."
                buttonText="Join Discussion"
                redirectTo="/discussions"
                variant="light"
                iconType="discussion"
            /> */}
        </div>
    )
}

export default index
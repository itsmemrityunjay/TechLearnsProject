import React from 'react'
import Header from './components/Header'
import MapTopics from './components/MapTopics'
import ReusableCTA from '../../utils/ReusableCTA'

const index = () => {
    return (
        <div>
            <Header />
            <MapTopics />
            <ReusableCTA
                title="Discover Our Competitions"
                description="Challenge yourself with our coding competitions and win exciting prizes."
                buttonText="Browse Competitions"
                redirectTo="/competitions"
                iconType="competition"
                variant="primary"
            />

        </div>
    )
}

export default index
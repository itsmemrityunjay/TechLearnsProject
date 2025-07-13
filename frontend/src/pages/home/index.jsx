import React from 'react'
import Navbar from '../../utils/Navbar'
import Hero from './component/Hero'
import About from './component/About'
import SkillIndia from './component/SkillIndia'
import UGCourses from './component/UGCourses'
import NEP from './component/NEP'
import Elementry from './component/Elementry'
import Competitions from './component/Competitions'
import Discussion from './component/Discussion'

import CTA from '../../utils/CTA'
import BelowPoverty from '../../utils/BelowPoverty'


const index = () => {
    return (
        <div>
            <Navbar />
            <Hero />
            <About />
            <SkillIndia />
            <UGCourses />
            <NEP />
            <Elementry />
            <Competitions />
            <Discussion />
            <BelowPoverty />
            <CTA />

        </div>
    )
}

export default index
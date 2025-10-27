'use client'

import Cube3D from "@/components/Cube3D"
import Navbar from "@/components/Navbar"
import { useState } from "react"

const Page = () => {
    const [resetViewCount, setResetViewCount] = useState(0);

    const handleResetView = () => {
        setResetViewCount((prev) => prev + 1);
    }

    return (
        <section className='text-foreground w-screen h-screen flex flex-col'>
            <Navbar handleResetView={handleResetView}/>
            <Cube3D resetViewCount={resetViewCount}/>
        </section>
    )
}

export default Page
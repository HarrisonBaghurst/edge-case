import React from 'react'

type NavbarProps = {
    handleResetView: () => void;
}


const Navbar = ({ handleResetView }: NavbarProps) => {
    return (
        <div className='w-full h-fit pt-(--padding-medium) flex justify-center'>
            <div className='w-1/2 py-(--padding-small) px-(--padding-small) bg-(--card-color) rounded-full flex justify-between'>
                <div className="font-bold h-8 w-8 bg-white rounded-full opacity-20" />
                <div className='flex gap-(--gap-medium)'>
                    <div className="font-bold h-8 w-8 bg-white rounded-full opacity-20" />
                    <div 
                    onClick={handleResetView}
                    className="font-bold h-8 w-8 bg-white rounded-full opacity-20" 
                    />
                </div>
            </div>
        </div>
    )
}

export default Navbar

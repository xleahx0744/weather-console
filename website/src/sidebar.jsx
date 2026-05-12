import { NavLink } from 'react-router-dom';
import logo from './assets/logo.png';
import { useSettings } from './hooks/useSettings';
import { useState } from 'react';

export default function Sidebar() {
    const defaultSettings = useSettings().settings;
    const [sidebar, setSidebar] = useState(true);

    const settings = localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings;
    const width = window.innerWidth;


    return (
        <nav className={`${settings.theme.sidebar} items-center h-max flex flex-col lg:flex-row lg:flex-wrap justify-between p-2 overflow-clip scrollbar-width-0`}>
            <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-12 w-16" />
                <h1 className="text-white lg:text-3xl text-lg font-bold w-max text-center">Greenup County Weather</h1>
                {width <= 768 && (
                    <button className="ml-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => setSidebar(!sidebar)}>{!sidebar ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>}</button>
                )}
            </div>
            {sidebar && <section className='text-white flex lg:gap-4 gap-2'>
                <NavLink to='/' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 lg:p-1 lg:text-xl lg:m-0 mt-4 mb-4 text-md font-semibold rounded-md ${settings.theme.sidebarPage} hover:border-2 duration-100 hover:border-green-500 ${isActive ? 'border-green-500 bg-gray-700' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                Home
                </NavLink>

                <NavLink to='/severe-weather' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 lg:p-1 lg:text-xl lg:m-0 mt-4 mb-4 text-md font-semibold rounded-md ${settings.theme.sidebarPage} hover:border-2 duration-100 hover:border-amber-500 ${isActive ? 'border-amber-500 bg-gray-700 border-2' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" /></svg>
                Weather
                </NavLink>

                <NavLink to='/risk' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 lg:p-1 lg:text-xl lg:m-0 mt-4 mb-4 text-md font-semibold rounded-md ${settings.theme.sidebarPage} hover:border-2 duration-100 hover:border-purple-500 ${isActive ? 'border-purple-500 bg-gray-700 border-2' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                Scores
                </NavLink>
                <NavLink to='/settings' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 lg:p-1 lg:text-xl lg:m-0 mt-4 mb-4 text-md font-semibold rounded-md ${settings.theme.sidebarPage} hover:border-2 duration-100 hover:border-gray-500 ${isActive ? 'border-gray-500 bg-gray-700 border-2' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5" /></svg>
                Settings
                </NavLink>
            </section>
        }
        </nav>
    )
}
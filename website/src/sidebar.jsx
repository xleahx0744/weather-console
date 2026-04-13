import { NavLink } from 'react-router-dom';
import logo from './assets/logo.png';

export default function Sidebar() {
    return (
        <nav className="bg-gray-800 w-full items-center h-16 flex justify-between p-2 border-b-6 border-gray-900 overflow-clip scrollbar-width-0">
            <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-12 w-16" />
                <h1 className="text-white text-3xl font-bold w-max text-center">Flatwoods Weather</h1>
            </div>
            <section className='text-white flex gap-4'>
                <NavLink to='/' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 p-1 text-xl font-semibold rounded-md bg-gray-800 text-white hover:bg-gray-700 hover:border-2 duration-100 hover:border-green-500 ${isActive ? 'border-green-500 bg-gray-700 border-2' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                Home
                </NavLink>

                <NavLink to='/severe-weather' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 p-1 text-xl font-semibold rounded-md bg-gray-800 text-white hover:bg-gray-700 hover:border-2 duration-100 hover:border-amber-500 ${isActive ? 'border-amber-500 bg-gray-700 border-2' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" /></svg>
                Weather
                </NavLink>

                <NavLink to='/risk' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 p-1 text-xl font-semibold rounded-md bg-gray-800 text-white hover:bg-gray-700 hover:border-2 duration-100 hover:border-purple-500 ${isActive ? 'border-purple-500 bg-gray-700 border-2' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                Scores
                </NavLink>
                <NavLink to='/settings' className={({ isActive }) =>
                    `items-center leading-10 flex gap-1 p-1 text-xl font-semibold rounded-md bg-gray-800 text-white hover:bg-gray-700 hover:border-2 duration-100 hover:border-gray-500 ${isActive ? 'border-gray-500 bg-gray-700 border-2' : ""}`
                }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" /></svg>
                Settings
                </NavLink>
            </section>
        </nav>
    )
}
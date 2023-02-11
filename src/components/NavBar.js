import moon from '../assets/icons/moon.png'
import sun from '../assets/icons/sun.png'
import { useRef } from 'react';

export function NavBar({ changeMode }) {
    const activeModeRef = useRef()

    function handleNightMode(e) {
        activeModeRef.current.classList.toggle('shift'); //this changes the day or night icon selected
        changeMode((prevMode) => !prevMode);//this changed the night mode on click
        document.querySelector('#root').classList.toggle('dark-theme')
    }

    return (
        <nav>
            <div className='title-tagLine-container'>
                <div className='title'>TypeScore</div>
                <div className='tagLine'>Type Better</div>
            </div>

            <div className='dayAndNigh-container'>
                <div className='dayAndNight-div' onClick={handleNightMode}>
                    <div className='active-mode' ref={activeModeRef}></div>
                    <img src={sun} alt="day" className='day-img' />
                    <img src={moon} alt="night" className='moon-img' />
                </div>
            </div>
        </nav>
    )
}
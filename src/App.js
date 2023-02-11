import { data } from './data/data.js'
import accuracy from './assets/icons/accuracy.png'
import speedometer from './assets/icons/speedometer.png'
import rabitStill from './assets/rabitStill.png'
import rabitStill_nightMode from './assets/rabitStill-nightMode.png'
import { useEffect, useRef, useState } from 'react';
import { ParagraphBox } from './components/ParagraphBox';
import { LineChart } from './components/LineChart.js';
import { NavBar } from './components/NavBar.js'

function App() {
  const [nightMode, setNightMode] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(0)
  const [timerCount, setTimerCount] = useState(0)

  const [currentPara, setCurrentPara] = useState(data[0])
  const [userInputPara, setUserInputPara] = useState('')
  const [showResults, setShowResult] = useState(false)
  const [speedValuesPerSecond, setSpeedValuesPerSecond] = useState([])
  const [timerOn, setTimerOn] = useState(false)
  
  const mistakeCount = useRef({ count: 0 }) //paragrahn box compoenent and handleReset function update and reset mistkae count
  const intervalRef = useRef({ id: null })

  useEffect(() => {
    if (timerCount === 0) return

    const timeInMinutes = timerCount / 60
    const noOfCharTyped = userInputPara.length
    const totalMistake = mistakeCount.current.count
    let typingSpeed = parseInt(((noOfCharTyped / 5) - totalMistake) / timeInMinutes);
    if (typingSpeed < 0) typingSpeed = 0
    setTypingSpeed(typingSpeed)
    setSpeedValuesPerSecond([...speedValuesPerSecond, typingSpeed])
  }, [timerCount])

  function handleInputChange(e) {
    setUserInputPara(e.target.value)
    if (!timerOn) {
      const id = setInterval(() => {
        setTimerCount((prevState) => {
          if (prevState === 30) {
            clearInterval(id)
            setShowResult(true)
            setTimerOn(false)
            intervalRef.current.id = null
            return prevState
          }
          return prevState + 1
        })
      }, 1000);
      intervalRef.current.id = id
      setTimerOn(true)
    }
  }

  function calculateAccuracy() {
    const noOfCharTyped = userInputPara.length
    const accuracy = ((noOfCharTyped - mistakeCount.current.count) / noOfCharTyped) * 100
    return accuracy.toFixed(1)
  }

  function handleReset() {
    setUserInputPara([])
    setShowResult(false)
    setSpeedValuesPerSecond([])
    setTypingSpeed(0)
    mistakeCount.current.count = 0
    if (intervalRef.current.id != null) {
      clearInterval(intervalRef.current.id)
    }
    setTimerCount(0)
    setTimerOn(false)
  }

  function handleNext() {
    const currentParaIndex = data.indexOf(currentPara)
    const randomNum = Math.floor(Math.random() * data.length)
    if (randomNum === currentParaIndex) {
      handleNext()
      return
    } else {
      setCurrentPara(data[randomNum])
      handleReset()
    }
  }

  return (
    <>
      <NavBar changeMode={setNightMode}/>
      {!showResults && <div className='container'>

        <div className='status-container flex-center'>
          <div className='time'>{30 - timerCount} sec</div>
          <div className='current-speed flex-center'>
            {timerOn ?
             nightMode? <div className='rabitGif-container nightMode-gif'></div>: <div className='rabitGif-container'></div>:
             nightMode? <img src={rabitStill_nightMode} className="rabit-img" alt=''/>: <img src={rabitStill} className="rabit-img" alt='' />}{typingSpeed}
          </div>
        </div>

          <ParagraphBox currentPara={currentPara} userInputPara={userInputPara} mistakeCount={mistakeCount} otherParas= {data}/>

        <div className='input-and-reset-container'>
          <input type="text" value={userInputPara}
                             autoComplete="new-password"
                             onChange={handleInputChange}
                             onPaste={(e)=>{
                              e.preventDefault()
                              return false
                             }}
                            placeholder="Start typing here.Best of luck!!" className="start-txt-box" />
          <button onClick={handleReset}>Restart </button>
        </div>

      </div>}

      {showResults &&
        <>
          <div className="graph-container">
            <LineChart speedValuesPerSecond={speedValuesPerSecond} />
          </div>

          <div className='result-controls'>
            <button onClick={handleReset}>Restart</button> <button onClick={handleNext}>Continue</button>
          </div>

          <div className='result-details'>
            <div className='details'><img src={speedometer}  alt="" /> {typingSpeed} <span>(Speed)</span></div>
            <div className='details'><img src={speedometer}  alt=""/> {(userInputPara.length / 5) / .5} <span>(Raw Speed)</span></div>
            <div className='details'><img src={accuracy} alt="" /> {calculateAccuracy()} <span>(Accuracy)</span> </div>
          </div>
        </>
      }

    </>
  )
}

export default App;

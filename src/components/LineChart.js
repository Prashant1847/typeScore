import { useEffect, useRef, useState } from 'react';

const TOTAL_TIME = 30

function Dots({ speedValues, maximumSpeed }) {
  return (
    <>
      {speedValues.map((speed, index) => {
        const time = index + 1; //max time would be 30sec
        const posOn_YAsix = `${(speed / maximumSpeed) * 100}%`
        const posOn_XAsix = `${(time / TOTAL_TIME) * 100}%`
        return (
          <div key={index} className='dot' style={{ bottom: posOn_YAsix, left: posOn_XAsix }}></div>
        )
      })}
    </>
  )
}

function Lines({ allDots }) {
  const [dimension, setDimension] = useState({ width: '', height: '' })

  //due to this lines are recalculated when window dimensions changes
  useEffect(() => {
    const documentEle = document.documentElement
    window.addEventListener('resize', () => setDimension({ width: documentEle.clientWidth, height: documentEle.clientHeight }))
    return () => {
      window.removeEventListener('resize', () => setDimension({ width: documentEle.clientWidth, height: documentEle.clientHeight }))
    }
  }, [])

  return (
    <>
      {allDots.map((dot, index) => {
        if (index + 1 > allDots.length - 1) return null
        const nextDotStyle = allDots[index + 1].getBoundingClientRect()
        const currentDotStyle = dot.getBoundingClientRect()

        const height = nextDotStyle.bottom - currentDotStyle.bottom
        const base = nextDotStyle.left - currentDotStyle.left
        const lineWidth = Math.sqrt((height * height) + (base * base)) //this formula is to calculate the widht of the connecting line
        const angleInRdian = Math.atan(height / base)
        const angleInDegree = (angleInRdian * 180) / Math.PI

        return (
          <div className='line' style={{
            width: lineWidth,
            transform: `rotate(${angleInDegree}deg)`,
            left: dot.style.left,
            bottom: dot.style.bottom
          }} key={index}>
          </div>
        )
      })}
    </>
  )
}

function X_marks({ gap = 2 }) {
  if (gap === 0) return
  const secondsWithGap = []
  for (let second = 1; second <= TOTAL_TIME; second += gap) secondsWithGap.push(second)

  return (
    <div className='x-axis'>
      {secondsWithGap.map(second => {
        const percentageOf30 = (second / TOTAL_TIME) * 100
        return <div key={second} style={{ left: `${percentageOf30}%` }}>{second}</div>
      })}
    </div>
  )
}

function calculateMax_YAxisPoint(highestValue) {
  while (!((highestValue % 5 === 0) && (highestValue % 4 === 0))) highestValue += 1;
  return highestValue
}

function YAxis_Marks({ highestValue }) {//maxLimist is the high
  const equalParts = highestValue / 4 //4 value is set and we don't want to split value futher
  const marks = []
  for (let i = 0; i <= highestValue; i += equalParts) {
    const percentage = (i / highestValue) * 100
    marks.push(<div className='y-marks' key={i} style={{ bottom: `${percentage}%` }}>{i}</div>)
  }
  return <div className='y-axis'>{marks}</div>
}

export function LineChart({ speedValuesPerSecond }) {
  const [allDots, setAllDots] = useState([])
  const highestSpeedValueOnYAsix = calculateMax_YAxisPoint(Math.max(...speedValuesPerSecond))
  const graphRef = useRef()

  useEffect(() => {
    setAllDots(Array.from(graphRef.current.getElementsByClassName('dot')))
  }, [])

  return (
    <>
      <div className="graph" ref={graphRef}>
        <Dots maximumSpeed={highestSpeedValueOnYAsix} speedValues={speedValuesPerSecond} />
        {graphRef.current && <Lines allDots={allDots} />}
        <YAxis_Marks highestValue={highestSpeedValueOnYAsix} />
        <X_marks gap={2} />
      </div>
    </>
  )
}

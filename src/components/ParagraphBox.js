import { useEffect, useRef, useState } from "react"

function converParaIntoSpanTagChar(para) {
    let lettersWithSpanTagWrapped = ''
    for (const char of para) lettersWithSpanTagWrapped += `<span>${char}</span>`
    return lettersWithSpanTagWrapped
}

function remove_Color_bgColor_cursor(paraWithSpanTag) {
    let index = 0
    while (true) {
        const { color, backgroundColor } = paraWithSpanTag[index].style
        const currentSpanTag = paraWithSpanTag[index]
        if (color === '' && backgroundColor === '') break

        if (backgroundColor === "red") currentSpanTag.style.backgroundColor = ""
        else currentSpanTag.style.color = ""

        index++
    }
    paraWithSpanTag[index - 1].classList.remove("cursor")
}


// function used in managin the user input and matching it with original para
function handleCharMatchAndMismatch(userChar, paraChar, charElementDom, mistakeCount) {
    const style = charElementDom.style
    if (userChar === paraChar) style.color = "green"
    else if (userChar !== paraChar) {
        if (style.color === "red" || style.backgroundColor == "red") return //this means a backspace key was typed and we are on char which was typed wrong,so do not increase mistake count twice
        mistakeCount.current.count += 1;
        if (paraChar === " ") style.backgroundColor = "red" //change bg color char was a space
        else style.color = "red"
    }
}


export function ParagraphBox({ currentPara, userInputPara, mistakeCount, otherParas }) {
    const [paraWithSpanTag, setParaWithSpanTag] = useState([])
    const previousCharIndex = useRef({ index: -1 })
    const previousIndexOffSetTop = useRef({ pos: 0 })
    const paraContainerRef = useRef()
    const currentParaIndex = useRef({ index: otherParas.indexOf(currentPara) }) //this is be used to add next para to the current para

    useEffect(() => { //this converts the current para to char with span tag and changed the inner html also sets the spanTag state
        const lettersWithSpanTagWrapped = converParaIntoSpanTagChar(currentPara)
        paraContainerRef.current.innerHTML = lettersWithSpanTagWrapped
        setParaWithSpanTag(paraContainerRef.current.getElementsByTagName('span'))
    }, [])

    //*************** */ use effects and it's supporting functions
    useEffect(() => {
        if (paraWithSpanTag.length === 0) return
        else if (userInputPara.length === 0) {
            if (checkIfCleanUpNeeded()) remove_Color_bgColor_cursor(paraWithSpanTag) //this means user has clicked ctrl+backspace and needs to handle it from 0 index
            resetPara(paraWithSpanTag)
            return
        }
        const currentCharIndex = userInputPara.length - 1
        const previousIndex = previousCharIndex.current.index
        const curCharOfUserInput = userInputPara.charAt(currentCharIndex)


        const spanTag = paraWithSpanTag[currentCharIndex] //getting the span tag node of it
        const paraChar = spanTag.innerText //getting the original char value
        //handles backspace and ctrl+backspace
        if (currentCharIndex == previousIndex - 1) handleBackspace(currentCharIndex)
        else if (currentCharIndex <= previousIndex - 2) handleCtrlBackspace(currentCharIndex)
        else if ((previousIndex + 2) <= currentCharIndex) {
            handleAutoCompleteInput(previousIndex, currentCharIndex, mistakeCount)
        } else {
            //char matching and updating mistake count
            handleCharMatchAndMismatch(curCharOfUserInput, paraChar, spanTag, mistakeCount)
        }

        //removes cursor pointer from previous char
        setAndRemoveCursorClass(currentCharIndex, previousIndex)
        //makes the pervious index == current index
        previousCharIndex.current.index = currentCharIndex
    }, [userInputPara])

    function handleAutoCompleteInput(previousCharIndex, currentCharIndex) {
        //previousCharIndex + 1 is done because we do not want to match the previous char again 
        for (let i = previousCharIndex + 1; i <= currentCharIndex; i++) {
            const curChar = userInputPara.charAt(i)
            const spanTag = paraWithSpanTag[i]
            const paraChar = spanTag.innerText
            handleCharMatchAndMismatch(curChar, paraChar, spanTag, mistakeCount)
        }
    }

    function resetPara(paraWithSpanTag) {
        mistakeCount.current.count = 0
        previousCharIndex.current.index = -1
        previousIndexOffSetTop.current.pos = 0
        scrollLineToCenter(paraWithSpanTag[0])
    }

    //this checks if the first char has any styles if they do have it means that user has pressed restart button 
    function checkIfCleanUpNeeded() {
        const spanTag_color = paraWithSpanTag[0].style.color
        if (spanTag_color === "green" || spanTag_color === "red") return true
        return false
    }

    function handleBackspace(currentCharIndex) {
        const nextSpan = paraWithSpanTag[currentCharIndex + 1]//nextspan is the char which has been backspaced
        const { color, backgroundColor } = nextSpan.style
        if (color === "red" || backgroundColor === "red") mistakeCount.current.count -= 1
        if (nextSpan.style.backgroundColor === "red") nextSpan.style.backgroundColor = ""
        else nextSpan.style.color = ""
    }

    function setAndRemoveCursorClass(toAddToIndex, toRemoveFromIndex) {
        paraWithSpanTag[toAddToIndex].classList.add('cursor')
        if (toRemoveFromIndex < 0) return
        paraWithSpanTag[toRemoveFromIndex].classList.remove('cursor')
    }

    function handleCtrlBackspace(currentCharIndex) {
        let index = currentCharIndex + 1 //we don't need to handle the character we are on
        while (true) {
            const { color, backgroundColor } = paraWithSpanTag[index].style
            const currentSpanTag = paraWithSpanTag[index]
            if (color === '' && backgroundColor === '') break

            if (color === "red" || backgroundColor === "red") mistakeCount.current.count -= 1;
            if (backgroundColor === "red") currentSpanTag.style.backgroundColor = ""
            else currentSpanTag.style.color = ""
            currentSpanTag.classList.remove('cursor')
            index++
        }
    }

    // ******************** end 

    // ************* use  effect and functions for handling line number and it's scrolling
    useEffect(() => {//this use effect maintian line number on which user is by comparing pos of each char typed from prev char
        if (paraWithSpanTag.length === 0 || userInputPara.length === 0) return
        const pos = previousIndexOffSetTop.current.pos
        const currentPos = paraWithSpanTag[userInputPara.length - 1].offsetTop
        if (pos != currentPos) {
            scrollLineToCenter(paraWithSpanTag[userInputPara.length -1])
            previousIndexOffSetTop.current.pos = currentPos
        }
    }, [userInputPara])

    function scrollLineToCenter(spanTagOfLineToScroll) {
        spanTagOfLineToScroll.scrollIntoView({
            block: 'center',
            inline: 'nearest'
        });
    }
    // *************** end

    //**************** use effect for adding para to existing para
    useEffect(() => {//this adds data to the current para if user types 60percent of the total chars 
        if (paraWithSpanTag.length === 0) return
        const _60PercentOfCurrentPara = Math.floor((60 / 100) * (paraWithSpanTag.length - 1))
        if (userInputPara.length - 1 === _60PercentOfCurrentPara) {
            let index = currentParaIndex.current.index
            if (index === otherParas.length - 1) index = 0
            else index += 1
            currentParaIndex.current.index = index
            const lettersWithSpanTagWrapped = converParaIntoSpanTagChar(otherParas[index])
            paraContainerRef.current.innerHTML = paraContainerRef.current.innerHTML + "<span> </span>" + lettersWithSpanTagWrapped
            setParaWithSpanTag(paraContainerRef.current.getElementsByTagName('span'))
        }
    }, [userInputPara])
    // *************end

    return (
        <div className='txt-container' ref={paraContainerRef}>
            {/* this is where the para will go after use effect  */}
        </div>
    )
}
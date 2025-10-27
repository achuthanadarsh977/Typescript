import { useState,useCallback , useEffect } from 'react'
import  words from './wordList.json'
import { HangmanDrawing } from './HangmanDrawing'
import { HangmanWord } from './HangmanWord'

import './App.css'

function App() {
  const[wordToGuess , setWordToGuess] = useState(() =>
  {return words[Math.floor(Math.random()*words.length)]})

  const  [guessedletters , setGuessedLetters] = useState<string[]>([])


  return(
    <div
     style = {{
      maxWidth:"800px",
      display:"flex",
      flexDirection:"column",
      gap:"2 rem",
      margin:"0 auto",
      alignItems:"center",
     }}
    >
      <div style = {{fontSize:"2rem",textAlign:"center"}}>Lose Win</div>
      <HangmanDrawing />
      <HangmanWord />
    </div>
  )
  
}

export default App;

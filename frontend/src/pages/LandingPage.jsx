import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Navigation2, List, Search, UserIcon, Quote
} from 'lucide-react'


import GoldenRetriever from "../assets/Images/GoldenRetriever.png"
import SquigglyLinePath from "../assets/Images/SquigglyLine.svg"
import { useAuth } from '../context/AuthContext'









//Utilities go here
function rotateVector(x, y, degrees) {
    // 1. Convert degrees to radians
    const radians = degrees * (Math.PI / 180);
    
    // 2. Pre-calculate sine and cosine for efficiency
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    // 3. Apply the rotation formula
    // Use temporary variables to avoid using an updated 'x' to calculate 'y'
    const newX = x * cos - y * sin;
    const newY = x * sin + y * cos;

    const normalized=normalize(-newX, newY)

    return { x:normalized.x, y:normalized.y };
}

function normalize(x, y) {
    const length = Math.sqrt(x * x + y * y);
    
    // Check for zero-length vector to avoid Division by Zero
    if (length === 0) return { x: 0, y: 0 };
    
    return {
        x: x / length,
        y: y / length
    };
}



//Small Components/helpers go here
const Box_Arrow=({text, arrow_angle, styles, theme_color})=>{

  const rotated_vector=rotateVector(0,1,arrow_angle)
  const left=50+rotated_vector.x*100
  const bottom=50+rotated_vector.y*100

  return (
    <div className="relative w-fit">
      
      <div className="absolute"
      style={{
        left: `${left}%`,
        bottom: `${bottom}%`,
        transform: `translate(-50%, 50%) rotate(${arrow_angle}deg)`,
        transformOrigin: 'center'
      }}
      >
        <Navigation2 fill={theme_color} stroke={theme_color} className="w-[20px]! h-[18px]!" preserveAspectRatio="none"/>
      </div>
      <span
      className={` ${styles} font-[Inter] text-[10px] text-white py-[0.2rem] px-[0.375rem] flex flex-row items-center justify-center select-none`}
      style={{backgroundColor:`${theme_color}`}}
      >{text}</span>
    </div>
  )
}

const Box_TextTemplate=({theme_color, size, rotation})=>{
  return (
    <div 
      className={`bg-white flex flex-col py-[5%] px-[6%]`}
      style={{width:`${size}rem`, height:`${size/2.3}rem`, borderColor:`${theme_color}`, borderWidth:`${size*3/100}rem`, transform: `rotate(${rotation}deg)`, transformOrigin: 'center'}}  
    >
      <div className="h-[15%] w-[90%] bg-[#ebebee] my-[1%]"></div>
      <div className="h-[15%] w-[90%] bg-[#ebebee] my-[1%]"></div>

      <div className="flex flex-row h-full gap-x-[2%] w-[80%]">
        <div className="h-[80%] w-[50%] mt-[3%]" style={{backgroundColor:`${theme_color}`}}></div>
        <div className="h-[80%] w-[50%] mt-[3%] border-[2px] flex flex-row items-center border-[#ebebee]">
          <div className="bg-[#ebebee] w-[40%] ml-[4%] aspect-square rounded-full" ></div>
          <div className="bg-[#ebebee] w-full h-[50%] flex min-w-0 mx-[10%]" ></div>
        </div>
      </div>

    </div>
  )
}

const ImageBubble=({img_url, theme_color, size, orientation, imgstyles, parentStyles})=>{
  return(
    <div 
    style={{width:`${size}rem`, height:`${size}rem`, backgroundColor:`${theme_color}`, position:"relative"}} 
    
    className={`${orientation==="left"?"rounded-l-full rounded-tr-full":"rounded-r-full rounded-tl-full"} p-1 flex flex-row justify-center items-center overflow-hidden ${parentStyles}`}>

      <div className={`absolute ${imgstyles}`}>
      {
        img_url &&
          <img src={img_url} alt="" />
      }
      </div>

    </div>
  )
}

const AccountCard=()=>{
  return(

    <div className="flex flex-col p-4 bg-white h-fit w-[230px] shadow-2xl">

      <div className="w-full justify-start flex flex-row h-[70px] bg-white">
        <div className="min-w-14 max-w-14 min-h-14 max-h-14 mr-2 rounded-full bg-blue-300 overflow-hidden relative">
          <div className="absolute top-[-15%] left-[19%] w-15 h-15">
            <img src={GoldenRetriever} alt="" />
          </div>
        </div>
        <div className="w-full flex flex-col bg-white">
          <span className="font-[Inter] text-[#575757] font-medium text-[15px]">Ben Stokes</span>
          <div className="ml-auto mt-1 w-[80%] rounded-full h-[10%] bg-[#e6e9ed]"></div>
          <div className="ml-auto mt-1 w-[50%] rounded-full h-[10%] bg-[#e6e9ed]"></div>
        </div>
      </div>

      <div className="w-full h-[30px] flex flex-row pt-1 bg-white">
        <div className="h-full w-full flex flex-row items-center bg-[#f8f9fc] rounded-[0.4rem] border border-[#ebf0f6]">
          <Search stroke="#e1e4eb" height={15} width={15} className="ml-3"/>
          <div className="w-[30%] h-[15%] rounded-full ml-5 bg-[#e1e4eb]"></div>
        </div>
      </div>

      <div className="w-full flex flex-col mt-2">
        <span className="font-[Inter] text-[13px] text-[]">Active Chats</span>
        <div className="flex flex-col w-full h-fit p-1 gap-2">

          <div className="flex flex-row w-full bg-[#f4f5f6] p-2 rounded-[0.5rem]">
            <div className="max-w-8 min-w-8 max-h-8 min-h-8 rounded-full bg-amber-400 font-[Inter] flex flex-row justify-center items-center text-white text-[0.8rem]">HB</div>
            <div className="flex flex-col w-full px-3 justify-center">
              <span className="font-[Inter] text-[0.8rem] mr-auto">Hamid Bro</span>
              <div className="w-[80%] h-[10%] bg-[#e1e4eb] rounded-full ml-[15%]"></div>
            </div>
          </div>

          <div className="flex flex-row w-full bg-[#f4f5f6] p-2 rounded-[0.5rem]">
            <div className="max-w-8 min-w-8 max-h-8 min-h-8 rounded-full bg-[#9083d5] font-[Inter] flex flex-row justify-center items-center text-white text-[0.8rem]">JC</div>
            <div className="flex flex-col w-full px-3 justify-center">
              <span className="font-[Inter] text-[0.8rem] mr-auto">Jummon Chow</span>
              <div className="w-[80%] h-[10%] bg-[#e1e4eb] rounded-full ml-[15%]"></div>
            </div>
          </div>

        </div>
      </div>

    </div>

  )
}

const ManWithTextBubble=()=>{
  return (
    <div className=" h-fit flex flex-col ml-7">
      <div className="relative w-full my-7">
        <div
          className="font-[Inter] text-white w-35 h-fit flex flex-row items-center bg-[#27333f] text-[10px] px-5 py-4 rounded-xl"
        >Let me know what you think!</div>
        <div
          className="bg-[#27333f] w-10 h-10 absolute left-[60%]"
          style={{ clipPath: "polygon(35% 0%, 50% 40%, 65% 0%)" }}
        ></div>
      </div>
      <ImageBubble orientation={"left"} img_url={GoldenRetriever} theme_color={"#9083d5"} size={9} imgstyles={"h-35 w-35 top-[-10%] left-[20%]"}/>
    </div>
  )
}

const Fact1=()=>{
  return(
    <div className="w-[400px] h-[270px] flex flex-col p-4">
      <span className="font-[Inter] font-bold text-[2rem] text-[#27333f]">You Talk Up To 6 Times Faster Than You Type</span>
      <span className="font-[Inter] text-[0.75rem] mt-4 pr-[3rem] text-[#828282]">With SmartCollab, you can capture your screen, voice, and face and instantly share your video in less than it would take you to type an email.</span>

      <div className=" bg-[#eef5ff] border border-[#c6ddff] rounded-[0.4rem] flex flex-col w-full mt-4 p-2 max-w-[80%] gap-1">
        <span className="font-[Inter] text-[0.75rem]">😊 Fun Fact</span>
        <span className="font-[Inter] text-[0.6rem] text-[#636774]">Did you know, you remember 95% of a message when it's watched vs. only 10% of what you read.</span>
      </div>
    </div>
  )
}

const Fact2=()=>{
  return(
    <div className="w-[400px] h-[270px] flex flex-col p-4">
      <span className="font-[Inter] font-bold text-[2rem] text-[#27333f] pr-1">Arrange Your Meeting by One Click Easily</span>
      <span className="font-[Inter] text-[0.75rem] mt-4 pr-[2.4rem] text-[#828282]">With SmartCollab's powerfull search tools it's dead simple to find exactly what you're looking for in seconds.And it's very easy arranging meetings in a flash.</span>

      <div className=" bg-[#eef5ff] border border-[#c6ddff] rounded-[0.4rem] flex flex-col w-full mt-4 p-2 max-w-[80%] gap-1">
        <span className="font-[Inter] text-[0.75rem]">😊 Fun Fact</span>
        <span className="font-[Inter] text-[0.6rem] text-[#636774]">Did you know, you remember our super fast tool is very easy to use in arranging meeting in a flash.</span>
      </div>
    </div>
  )
}

const HrDiscussionCrad=()=>{
  return(
    <div className="bg-[#eef5ff] h-[300px] w-[270px] rounded-[0.8rem] flex flex-col items-center py-2 px-5">

      <div className="w-[140%] flex flex-row items-center bg-white py-2 px-2 rounded-l-full rounded-br-full shadow-2xl mt-7">
        <div className="mx-2"><Search stroke="#b0b8c6" size={18}/></div>
        <span className="mr-auto font-[Inter] text-[0.8rem] text-[#b0b8c6]">meeting/member/topic</span>
        <button
            className="
              bg-[#096cfe] text-[0.7rem] font-[Inter] text-white
              px-4 py-[0.4rem] rounded-l-full rounded-br-full ml-1.5 mr-1
            "
          >Search</button>
      </div>

      <div className="flex flex-row w-full justify-center mt-4">
        <div className="border rounded-[0.3rem] mx-1.5 flex flex-row items-center p-2 w-full border-[#454545]">
          <Search size={15} stroke="#aeb6c5" className="mr-2"/>
          <span className="font-[Inter] text-[0.8rem] text-[#757a89] mr-auto">Hiring</span>
          <div className="min-w-4 max-w-4 min-h-4 max-h-4 rounded-full bg-white flex justify-center items-center leading-0 font-[Inter] text-[0.8rem] ml-auto text-[#757a89]">x</div>
        </div>
        <div className="border rounded-[0.3rem] mx-1.5 flex flex-row items-center p-2 w-full border-[#454545]">
          <UserIcon size={15} stroke="#aeb6c5" className="mr-2"/>
          <span className="font-[Inter] text-[0.8rem] text-[#757a89] mr-auto">Hiring</span>
          <div className="min-w-4 max-w-4 min-h-4 max-h-4 rounded-full bg-white flex justify-center items-center leading-0 font-[Inter] text-[0.8rem] ml-auto text-[#757a89]">x</div>
        </div>
      </div>

      <div className=" mt-[1rem] w-full bg-white flex flex-col p-3 rounded-[0.5rem]">
        
        <div className="flex flex-row">
          <span className="font-[Inter] text-[0.7rem] mr-auto">HR Discussions</span>
          <span className="font-[Inter] text-[0.7rem] text-[#c8c8c8]">1 day ago</span>
        </div>
        <div className="flex flex-row items-center mt-[0.5rem]">
          <div className=" w-8 h-8 bg-[#e5e5e5] rounded-full flex justify-center items-center relative overflow-hidden mr-2">
            <img src={GoldenRetriever} alt="" className="absolute top-[-20%] left-[20%] "/>
          </div>
          <span className="text-[0.7rem] font-[Inter]">Ben Lelly</span>
        </div>

        <div className="flex flex-row mt-[0.5rem]">
          <Quote stroke="#ffc623" fill="#ffc623" preserveAspectRatio="none" width={40} height={20} className="mr-2 mt-[0.1rem]"/>
          <span className="font-[Inter] text-[0.6rem]">As we are providing the best and good quality of services for the clients.</span>
        </div>

      </div>


    </div>
  )
}

//Main components go here
const Header=()=>{

  const headerOptions=[
    {name:"Home", highlited:true},
    {name:"Services", highlited:false},
    {name:"Project", highlited:false},
    {name:"Riview", highlited:false}
  ]

  const navigate=useNavigate()

  return (
    <div className="z-50 top-0 sticky w-full min-w-0 flex bg-white justify-center px-2">
      <div className="w-full min-w-0 max-w-[1000px]  h-full bg-white rounded-2xl flex flex-row px-1.5 py-5 mt-2 items-center">
        <div className="text-[1rem] ml-3 font-extrabold font-[Inter] text-[#2d3945]">
          SmartCollab.
        </div>
        <div className="w-full h-full max-w-[300px] flex flex-row items-center justify-center mx-auto">
            {
              headerOptions.map((option, index)=>{
                return(
                  <span key={index}
                    className={`
                    mx-auto text-[0.9rem] font-medium font-[Inter] text-[#737785]
                    hover:text-[#096cfe] transition-colors duration-200 cursor-pointer select-none ${option.highlited?"text-[#096cfe]":"text-[#737785]"}
                    `}
                  >{option.name}</span>
                )
              })
            }
        </div>
        <div className="flex flex-row h-full items-center mr-3"
        >
          <span 
          onClick={()=>{navigate("/login")}}
          className="
            text-[0.8rem] text-[#3d4752] hover:text-[#096cfe]
            font-bold font-[Inter] cursor-pointer ml-1 mr-1.5
            ">Log In</span>
          <button
            onClick={()=>{navigate("/signup")}}
            className="
              bg-[#096cfe] text-[0.8rem] font-[Inter] text-white
              px-4 py-[0.4rem] rounded-l-full rounded-br-full ml-1.5 mr-1 select-none cursor-pointer
            "
          >Sign Up</button>
        </div>
      </div>
    </div>
  )
}

const Section1=()=>{
  return (

    <div className="relative w-full h-[350px] mt-5 flex flex-col items-center">

      <div className="w-full h-fit p-5">
        <div className=" 
          flex flex-col justify-center text-[2.9rem] items-center
          font-[Inter] font-bold text-[#26323e] w-full mt-8
          ">
          <h1 className="text-center text-[3.5rem] leading-12">Work Collaboration</h1>
          <h1 className=" leading-15 text-[3.5rem]">Easy & Fast</h1>
        </div>

        <div className="w-full flex flex-col items-center justify-center">
          <span
          className="w-full text-center max-w-[350px] flex min-w-0 text-[0.85rem] mt-8 text-[#919191] font-medium font-[Inter]"
          >The online collaborative whiteboard platform to bring teams together, anytime, anywhere.</span>
          <button
              className="
                bg-[#096cfe] text-[0.7rem] font-[Inter] text-white
                px-5 py-[0.9rem] rounded-l-full rounded-br-full mt-8
              "
            >Start a whiteboard</button>
          <span
          className="w-full text-center max-w-[350px] min-w-0 text-[0.85rem] mt-8 text-[#919191] font-medium font-[Inter] select-none"
          >Free forever- no credit card required</span>
          {/* <Box_Arrow text={"Some guy"} color={"#00ff00"} arrow_angle={216}/> */}
          {/* <Box_TextTemplate size={100} theme_color={"#ff00ff"}/> */}
          {/* <ImageBubble img_url={GoldenRetriever} theme_color="#ff00ff" size={8} orientation="" imgstyles={"h-40 w-40 left-3 bottom-3"}/> */}
          {/* <img src={SquigglyLinePath} width={200} height={200} /> */}
        </div>
      </div>

      <div className="absolute w-full h-full top-0 max-w-[1000px]">
        <div className="w-full h-full relative">
          <div className="absolute top-[8%] left-[82%]">
            <Box_Arrow text="Mark" arrow_angle={220} theme_color="#9083d5"/>
          </div>
          <div className="absolute top-[42%] left-[82%] h-[3.5rem] w-[3.5rem] bg-[#2fd8e4] rounded-l-xl rounded-br-xl ">
            <div className="h-[3rem] w-[3rem] blur-xl bg-[#8ee0e4b8]"></div>
          </div>
          <div className="absolute top-[15%] left-[12%]">
            <div className="w-full h-full relative">
              <div 
                className="absolute top-[90%] h-[1rem] w-[1.2rem] bg-[#2fd8e4]"
                style={{ clipPath: "polygon(50% 0%, 20% 40%, 20% 0%)" }}
              ></div> 
              <div className="h-[1rem] relative w-[1.2rem] rounded-[0.25rem] bg-[#2fd8e4]">
                <div className="absolute bg-white top-[30%] left-[20%] w-[60%] h-[9%]"></div>
                <div className="absolute bg-white top-[50%] left-[20%] w-[40%] h-[10%]"></div>
              </div>
            </div>
          </div>
          <div className="absolute top-[80%] left-[6%]">
            <Box_Arrow text="Anna" arrow_angle={45} theme_color="#ffc623"/>
          </div>
          <div className="absolute top-[60%] left-[12%]">
            <Box_TextTemplate theme_color="#ffedab" size={9} rotation={10}/>
          </div>
          <div className="absolute top-[90%] left-[88%]">
            <Box_Arrow text="Elena" arrow_angle={320} theme_color="#5899fd"/>
          </div>
          <div className="absolute top-[74%] left-[69%] w-[175px] aspect-auto">
            <img src={SquigglyLinePath} alt="" />
          </div>

          <div className="absolute flex flex-row top-[130%] left-[10%]">
            <ImageBubble img_url={GoldenRetriever} theme_color="#ffc623" size={12} orientation="left" imgstyles={"top-[-20%] left-[20%] w-50 aspect-auto"}/>
            <div className="flex flex-col justify-end px-5 text-[12px]">
              <div className="font-[Inter] shadow-xl w-fit bg-white shadow-black/4 my-1 p-2 rounded-xl text-[#777a83] select-none">
                Hey Bill, nice to meeet you!
              </div>
              <div className="font-[Inter] shadow-xl w-fit bg-white shadow-black/4 my-1 p-2 rounded-xl text-[#777a83] select-none">
                Hope you're doing fine.
              </div>
            </div>
          </div>

          <div className="absolute flex flex-row top-[130%] left-[35%]">
            <ImageBubble img_url={GoldenRetriever} theme_color="#5899fd" size={5}  imgstyles={"top-[-30%] left-[10%] w-25 aspect-auto"}/>
            <div className="font-bold flex flex-col justify-start px-5 text-[12px]">
              <div className="font-[Inter] shadow-xl w-fit bg-white shadow-black/4 my-1 p-2 rounded-xl text-[#777a83] flex flex-row items-center select-none">
                <div className="h-5 w-5 p-1 rounded-full flex flex-row items-center justify-center bg-amber-300 mx-1">
                  <div className="h-2 w-2 bg-white ml-0.5"
                  style={{ clipPath: "polygon(0% 0%, 0% 100%, 100% 50%)" }}
                  ></div>
                </div>
                <div>Video Call</div>
              </div>
            </div>
          </div>

          <div className="absolute flex flex-col top-[140%] left-[55%]">
            <ImageBubble img_url={GoldenRetriever} theme_color="#2fd8e4" size={10}  imgstyles={"top-[-20%] left-[10%] w-45 aspect-auto"}/>
            <div className="flex text-[12px]">
              <div className="font-[Inter] shadow-xl w-fit bg-white shadow-black/4 my-1 p-2 rounded-xl text-[#777a83] flex flex-row justify-start select-none">
                <div>I am fine, How are you?</div>
              </div>
            </div>
          </div>

          <div className="absolute flex flex-col top-[120%] left-[78%] select-none">
            <ImageBubble img_url={GoldenRetriever} orientation="left" theme_color="#9083d5" size={6}  imgstyles={"top-[-20%] left-[15%] w-30 aspect-auto"}/>
            <div className="flex text-[12px]">
              <div className="font-[Inter] shadow-xl w-fit bg-white shadow-black/4 my-1 p-2 rounded-xl text-[#777a83] flex flex-row items-center justify-start font-bold gap-1">
                <List stroke="#5899fd"/>
                <div>News Feed</div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
    
  )
}

const Section2=()=>{
  return(
    <div className="w-full min-h-[500px] mt-[400px] flex justify-center">
      <div className="w-full h-[450px] max-w-[1000px] flex relative">
        <div className="absolute top-[20%] left-[12%]">
          <ImageBubble size={6} theme_color="#9083d5"/>
        </div>
        <div className="absolute top-[20%] left-[75%]">
          <ImageBubble size={2} theme_color="#ffc623"/>
        </div>
        <div className="absolute top-[75%] left-[83%]">
          <ImageBubble size={5} theme_color="#5899fd" orientation={"left"}/>
        </div>

        <div
          className="h-[300px] w-[450px] bg-[#e7caab] rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden relative absolute top-[40%] left-[40%]"
        >
          <div className="left-[20%] top-[-30%] absolute">
            <img src={GoldenRetriever} alt="" />
          </div>
        </div>

        <div className="bg-white w-full max-w-[350px] py-10 pl-10 pr-15 flex flex-col items-center h-fit absolute shadow-xl
        top-[8%] left-[18%]
        ">
          <h1
            className="font-[Inter] text-4xl text-[#27333f] font-bold"
          >Building Better Collaboration by Connecting People</h1>

          <span
            className="font-[Inter] text-[13px] text-[#686b76] mt-5"
          >SmartCollab helps you connect with your team using online scheduling that is branded to your company and can grow with you.</span>
          
          <button
            className="
              bg-[#096cfe] text-[0.7rem] font-[Inter] text-white
              px-4 py-[0.4rem] rounded-l-full rounded-br-full mt-5 mr-auto
            "
          >Learn More</button>
        </div>


      </div>
    </div>
  )
}


const Section3=()=>{

  return (
    <div className="w-full h-[700px] flex flex-col items-center mt-[130px]">
      <div className="w-full h-full max-w-[1000px] flex flex-row">

        <div className="flex flex-row ml-[5rem] mr-[4rem]">
          <AccountCard/>
          <ManWithTextBubble/>
        </div>
        <div className="flex flex-row mr-auto ml-[4rem]">
          <Fact1/>
        </div>

      </div>
      <div className="w-full h-full max-w-[1000px] flex flex-row">

      <div className="flex flex-row ml-[6rem] mr-[5rem]">
        <Fact2/>
      </div>
      <div className="flex flex-row mr-[8rem] ml-[5rem]">
        <HrDiscussionCrad/>
      </div>

      </div>
    </div>
  )
}

const Footer=()=>{
  const navigate=useNavigate()
  const inputRef=useRef()
  const {setLandingPageEmail}=useAuth()
  useState(()=>{setLandingPageEmail("")},[])
  return(
    <div className="w-full h-[250px] mt-[130px] flex flex-row justify-center items-center bg-[#eef5ff]">
      <div className="w-full h-fit max-w-[1000px] bg-[#eef5ff] flex flex-col items-center">
        <h1 className="font-[Inter] font-bold text-[2rem] text-[#27333f]">Get Started. Try SmartCollab</h1>
        <div className="flex rounded-l-full rounded-br-full flex-row bg-white h-[45px] mt-5">
          
          <div className="rounded-l-full pl-5 flex items-center w-full h-full max-w-[15rem]">
            <input ref={inputRef} type="text" placeholder="Your work email" className="font-[Inter] w-full mr-2 text-[0.85rem] focus:outline-none" 
            onChange={()=>{setLandingPageEmail(inputRef.current.value)}}
            />
          </div>
          <button
            className="
              bg-[#096cfe] text-[0.8rem] font-[Inter] text-white
              px-7 py-[0.4rem] rounded-l-full rounded-br-full w-[150px]
            "
            onClick={()=>{navigate("/signup")}}
          >Sign Up</button>

        </div>
      </div>
    </div>
  )
}


function LandingPage() {

  return (
    <div className="relative flex flex-col items-center w-full h-fit">
      <Header/>
      <Section1/>
      <Section2/>
      <Section3/>
      <Footer/>
    </div>
  )
}







export default LandingPage
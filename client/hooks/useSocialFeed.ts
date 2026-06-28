import {useEffect,useState} from "react"
import {startSocialEngine} from "@/lib/socialEngine"

export default function useSocialFeed(){

 const [events,setEvents]=useState<any[]>([])

 useEffect(()=>{

   const stop=startSocialEngine((event)=>{
     setEvents(prev=>[event,...prev.slice(0,20)])
   })

   return stop

 },[])

 return events
}
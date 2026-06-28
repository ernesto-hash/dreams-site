
import { useEffect,useState } from "react"
import { supabase } from "@/lib/supabase"

export default function useLiveUsers(){

 const [viewers,setViewers]=useState(0)

 useEffect(()=>{

  async function load(){
   const {count}=await supabase
    .from("live_sessions")
    .select("*",{count:"exact",head:true})

   setViewers(count||0)
  }

  load()

  const channel=supabase.channel("live-users")
   .on("postgres_changes",
     {event:"UPDATE",schema:"public",table:"live_sessions"},
     ()=> load()
   )
   .subscribe()

  return ()=> supabase.removeChannel(channel)

 },[])

 return viewers
}

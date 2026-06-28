import { supabase } from "@/lib/supabase"
import { v4 as uuid } from "uuid"

export async function registerSession(){

 let session = localStorage.getItem("live_session")

 if(!session){
   session = uuid()
   localStorage.setItem("live_session",session)
 }

 const geo = await fetch("https://ipapi.co/json/")
  .then(r=>r.json())

 await supabase.from("live_sessions").upsert({
   session_id:session,
   country:geo.country_name,
   city:geo.city,
   last_seen:new Date()
 })
}

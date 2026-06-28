import { supabase } from "@/lib/supabase"

export function startSocialEngine(onEvent:(event:any)=>void){

 const channel = supabase
   .channel("social-engine")

   .on("postgres_changes",
     {event:"INSERT",schema:"public",table:"dreams"},
     payload=>{
       onEvent({
         type:"new_dream",
         data:payload.new
       })
     }
   )

   .on("postgres_changes",
     {event:"INSERT",schema:"public",table:"dream_relations"},
     payload=>{
       onEvent({
         type:"new_relation",
         data:payload.new
       })
     }
   )

   .on("postgres_changes",
     {event:"UPDATE",schema:"public",table:"live_sessions"},
     payload=>{
       onEvent({
         type:"live_join",
         data:payload.new
       })
     }
   )

   .subscribe()

 return ()=> supabase.removeChannel(channel)
}

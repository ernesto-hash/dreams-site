export default function SocialNotifications({events}:{events:any[]}){

    return(
     <div className="fixed bottom-6 right-6 space-y-2 z-50">
   
      {events.slice(0,3).map((e,i)=>(
        <div key={i} className="card-dark p-3 text-xs">
   
          {e.type==="live_join" &&
            <>🔥 Someone from {e.data.country} joined</>
          }
   
          {e.type==="new_dream" &&
            <>🔥 New dream added</>
          }
   
          {e.type==="new_relation" &&
            <>🔥 Someone related to a dream</>
          }
   
        </div>
      ))}
   
     </div>
    )
   }
   
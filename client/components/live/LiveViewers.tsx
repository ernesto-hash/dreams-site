import useLiveUsers from "@/hooks/useLiveUsers"

export default function LiveViewers(){

 const viewers=useLiveUsers()

 return(
  <div className="text-center py-6">
   👁 {viewers} people viewing now
  </div>
 )
}

import ChatwithAi from '@/_components/ChatwithAi'
import ShowingPlaceInMap from '@/_components/ShowingPlaceInMap'

const page = () => {
  return (
    <div className="flex w-full h-screen">

      {/* Left Section - Chat */}
      <div className="w-1/2 h-full overflow-y-auto border-r">
        <ChatwithAi />
      </div>

      {/* Right Section - Map */}
      <div className="w-1/2 h-full">
        <ShowingPlaceInMap/>
      </div>

    </div>
  )
}

export default page

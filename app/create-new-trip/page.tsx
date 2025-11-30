import ChatwithAi from '@/_components/ChatwithAi'
import ShowingPlaceMap from '@/_components/ShowingPlaceMap'
import React from 'react'

const page = () => {
  return (
    <div className="flex w-full h-screen">

      {/* Left Section - Chat */}
      <div className="w-1/2 h-full overflow-y-auto border-r">
        <ChatwithAi />
      </div>

      {/* Right Section - Map */}
      <div className="w-1/2 h-full">
        <ShowingPlaceMap />
      </div>

    </div>
  )
}

export default page

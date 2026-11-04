import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Spin indicator={antIcon} size="large" />
      <div className="mt-4 text-lg font-medium text-black flex items-center">
        Loading
        <span className="ml-1 flex space-x-1">
          <span className="animate-bounce [animation-delay:0ms]">.</span>
          <span className="animate-bounce [animation-delay:200ms]">.</span>
          <span className="animate-bounce [animation-delay:400ms]">.</span>
        </span>
      </div>
    </div>
  )
}

export default Loading
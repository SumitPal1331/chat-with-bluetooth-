"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bluetooth,
  BluetoothConnected,
  Search,
  Send,
  Users,
  WifiOff,
  Smartphone,
  Laptop,
  Headphones,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BluetoothDevice {
  id: string
  name: string
  type: "phone" | "laptop" | "headphones" | "unknown"
  connected: boolean
  rssi: number
}

interface Message {
  id: string
  deviceId: string
  deviceName: string
  content: string
  timestamp: Date
  sent: boolean
}

export default function BluetoothChatApp() {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [bluetoothSupported, setBluetoothSupported] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if Web Bluetooth is supported
    setBluetoothSupported("bluetooth" in navigator)

    // Load saved messages from localStorage
    const savedMessages = localStorage.getItem("bluetooth-chat-messages")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }

    // Simulate some nearby devices for demo
    const simulatedDevices: BluetoothDevice[] = [
      { id: "1", name: "Alice's iPhone", type: "phone", connected: false, rssi: -45 },
      { id: "2", name: "Bob's MacBook", type: "laptop", connected: false, rssi: -62 },
      { id: "3", name: "Charlie's Android", type: "phone", connected: false, rssi: -38 },
      { id: "4", name: "AirPods Pro", type: "headphones", connected: false, rssi: -55 },
    ]
    setDevices(simulatedDevices)
  }, [])

  useEffect(() => {
    // Save messages to localStorage
    localStorage.setItem("bluetooth-chat-messages", JSON.stringify(messages))
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Smartphone className="h-4 w-4" />
      case "laptop":
        return <Laptop className="h-4 w-4" />
      case "headphones":
        return <Headphones className="h-4 w-4" />
      default:
        return <Bluetooth className="h-4 w-4" />
    }
  }

  const scanForDevices = async () => {
    setIsScanning(true)

    if (bluetoothSupported) {
      try {
        // Use Web Bluetooth API for real device scanning (limited to BLE)
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["battery_service", "device_information"],
        })

        if (device.name) {
          const newDevice: BluetoothDevice = {
            id: device.id || Math.random().toString(),
            name: device.name,
            type: "unknown",
            connected: false,
            rssi: -50,
          }

          setDevices((prev) => {
            const exists = prev.find((d) => d.id === newDevice.id)
            if (!exists) {
              return [...prev, newDevice]
            }
            return prev
          })
        }
      } catch (error) {
        console.log("Bluetooth scan cancelled or failed:", error)
      }
    }

    // Simulate scanning animation
    setTimeout(() => {
      setIsScanning(false)
      toast({
        title: "Scan Complete",
        description: `Found ${devices.length} nearby devices`,
      })
    }, 2000)
  }

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      // Simulate connection process
      setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, connected: true } : d)))

      setConnectedDevices((prev) => [...prev, { ...device, connected: true }])

      toast({
        title: "Connected",
        description: `Connected to ${device.name}`,
      })

      // Simulate receiving a welcome message
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Math.random().toString(),
          deviceId: device.id,
          deviceName: device.name,
          content: `Hello! I'm connected via Bluetooth.`,
          timestamp: new Date(),
          sent: false,
        }
        setMessages((prev) => [...prev, welcomeMessage])
      }, 1000)
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to ${device.name}`,
        variant: "destructive",
      })
    }
  }

  const disconnectDevice = (device: BluetoothDevice) => {
    setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, connected: false } : d)))

    setConnectedDevices((prev) => prev.filter((d) => d.id !== device.id))

    if (selectedDevice?.id === device.id) {
      setSelectedDevice(null)
    }

    toast({
      title: "Disconnected",
      description: `Disconnected from ${device.name}`,
    })
  }

  const sendMessage = () => {
    if (!currentMessage.trim() || !selectedDevice) return

    const newMessage: Message = {
      id: Math.random().toString(),
      deviceId: selectedDevice.id,
      deviceName: selectedDevice.name,
      content: currentMessage.trim(),
      timestamp: new Date(),
      sent: true,
    }

    setMessages((prev) => [...prev, newMessage])
    setCurrentMessage("")

    // Ensure scroll to bottom after message is added
    setTimeout(() => {
      scrollToBottom()
    }, 100)

    // Simulate receiving a response
    setTimeout(
      () => {
        const responses = [
          "Got your message!",
          "Thanks for reaching out via Bluetooth!",
          "This offline chat is pretty cool!",
          "No internet needed for this conversation!",
          "Bluetooth messaging works great!",
          "I received your message loud and clear!",
          "Peer-to-peer communication is awesome!",
        ]

        const responseMessage: Message = {
          id: Math.random().toString(),
          deviceId: selectedDevice.id,
          deviceName: selectedDevice.name,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          sent: false,
        }
        setMessages((prev) => [...prev, responseMessage])
      },
      1000 + Math.random() * 2000,
    )
  }

  const getMessagesForDevice = (deviceId: string) => {
    return messages.filter((m) => m.deviceId === deviceId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BluetoothConnected className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Bluetooth Chat</h1>
                <p className="text-gray-600">Peer-to-peer messaging without internet</p>
                <p className="text-xs text-gray-500">Created by Sumit Pal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-gray-400" />
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Offline Mode
              </Badge>
            </div>
          </div>

          {!bluetoothSupported && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Bluetooth className="h-5 w-5" />
                  <span className="font-medium">Limited Bluetooth Support</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Web browsers only support Bluetooth Low Energy (BLE). For full peer-to-peer chat, use a native mobile
                  app. This demo simulates the experience.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Discovery Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Device Discovery
                  </span>
                  <Button onClick={scanForDevices} disabled={isScanning} size="sm">
                    {isScanning ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Scanning...
                      </div>
                    ) : (
                      "Scan"
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {devices.map((device) => (
                      <div key={device.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(device.type)}
                            <div>
                              <div className="font-medium text-sm">{device.name}</div>
                              <div className="text-xs text-gray-500">Signal: {device.rssi} dBm</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={device.connected ? "destructive" : "default"}
                            onClick={() => (device.connected ? disconnectDevice(device) : connectToDevice(device))}
                          >
                            {device.connected ? "Disconnect" : "Connect"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Connected Devices */}
            <Card className="bg-white/80 backdrop-blur-sm mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Connected ({connectedDevices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connectedDevices.map((device) => (
                    <div
                      key={device.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedDevice?.id === device.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedDevice(device)}
                    >
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.type)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{device.name}</div>
                          <div className="text-xs text-gray-500">{getMessagesForDevice(device.id).length} messages</div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                  {connectedDevices.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No connected devices</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  {selectedDevice ? (
                    <>
                      {getDeviceIcon(selectedDevice.type)}
                      Chat with {selectedDevice.name}
                      <Badge variant="outline" className="ml-auto">
                        {getMessagesForDevice(selectedDevice.id).length} messages
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Bluetooth className="h-5 w-5" />
                      Select a device to start chatting
                    </>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {selectedDevice ? (
                  <>
                    {/* Messages Container - Properly constrained */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="px-4 py-4 space-y-4">
                          {getMessagesForDevice(selectedDevice.id).length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {getDeviceIcon(selectedDevice.type)}
                                <span className="font-medium">{selectedDevice.name}</span>
                              </div>
                              <p className="text-sm">Start a conversation by sending a message below</p>
                            </div>
                          ) : (
                            getMessagesForDevice(selectedDevice.id).map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[70%] p-3 rounded-lg shadow-sm break-words ${
                                    message.sent
                                      ? "bg-blue-500 text-white rounded-br-sm"
                                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                  }`}
                                >
                                  <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                                    {message.sent ? (
                                      "You"
                                    ) : (
                                      <>
                                        {getDeviceIcon(selectedDevice.type)}
                                        {message.deviceName}
                                      </>
                                    )}
                                  </div>
                                  <div className="break-words overflow-wrap-anywhere">{message.content}</div>
                                  <div className="text-xs opacity-60 mt-2 text-right">
                                    {message.timestamp.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Message Input - Fixed at bottom */}
                    <div className="border-t bg-white p-4 flex-shrink-0">
                      <div className="flex gap-2">
                        <Input
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          placeholder={`Message ${selectedDevice.name}...`}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          className="flex-1"
                          maxLength={500}
                        />
                        <Button onClick={sendMessage} disabled={!currentMessage.trim()} className="px-4">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>Press Enter to send</span>
                        <span>{currentMessage.length}/500</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
                    <div className="text-center">
                      <Bluetooth className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="font-medium text-lg mb-2">No Device Selected</h3>
                      <p className="text-sm mb-4">Choose a connected device from the left panel to start chatting</p>
                      {connectedDevices.length === 0 && (
                        <p className="text-xs text-gray-400">First scan and connect to nearby Bluetooth devices</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <WifiOff className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">No Internet Required</h3>
              <p className="text-sm text-gray-600">Direct device-to-device communication</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <BluetoothConnected className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">Bluetooth Mesh</h3>
              <p className="text-sm text-gray-600">Connect to multiple devices simultaneously</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Real-time Chat</h3>
              <p className="text-sm text-gray-600">Instant messaging with nearby devices</p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Note */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Implementation Notes</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                • <strong>Web Limitations:</strong> Browsers only support Bluetooth Low Energy (BLE) with limited
                messaging capabilities
              </p>
              <p>
                • <strong>Native Apps:</strong> For full peer-to-peer chat, develop native Android/iOS apps using
                Bluetooth Classic
              </p>
              <p>
                • <strong>Real Implementation:</strong> Use Android BluetoothAdapter or iOS Core Bluetooth frameworks
              </p>
              <p>
                • <strong>This Demo:</strong> Simulates the experience with local storage and mock devices
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Creator Footer */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bluetooth className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-800">Bluetooth Chat App</span>
            </div>
            <p className="text-gray-600 mb-1">
              Developed by <span className="font-semibold text-blue-700">Sumit Pal</span>
            </p>
            <p className="text-sm text-gray-500">Innovative peer-to-peer communication without internet dependency</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

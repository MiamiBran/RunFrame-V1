"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { useRunframeStore } from "@/store/useRunframeStore"
import { ArrowLeft, ArrowRight } from "lucide-react"
import "swiper/css"

export default function SprintWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { modules, addSprint } = useRunframeStore()

  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [deliverable, setDeliverable] = useState("")
  const [lengthDays, setLengthDays] = useState(7)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)

  // Pre-select module from URL params
  useEffect(() => {
    const moduleId = searchParams.get("module")
    if (moduleId) {
      const module = modules.find((m) => m.id === moduleId)
      if (module) {
        setSelectedModule(module)
        setCurrentSlide(1) // Skip to deliverable step
        setTimeout(() => swiperInstance?.slideTo(1), 100)
      }
    }
  }, [modules, searchParams, swiperInstance])

  const handleStartSprint = async () => {
    if (!selectedModule || !deliverable) return

    await addSprint(selectedModule.id, deliverable, lengthDays)
    router.push("/")
  }

  const canProceed = () => {
    if (currentSlide === 0) return selectedModule
    if (currentSlide === 1) return deliverable.trim()
    if (currentSlide === 2) return true
    return false
  }

  const nextSlide = () => {
    if (swiperInstance && canProceed()) {
      swiperInstance.slideNext()
    }
  }

  const prevSlide = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-signal to-purple-400 bg-clip-text text-transparent mb-2">
            Sprint Wizard
          </h1>
          <p className="text-gray-400">Set up your focused execution sprint</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= currentSlide ? "bg-signal" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Swiper Carousel */}
        <Swiper
          slidesPerView={1}
          allowTouchMove={true}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          className="w-full mb-8"
        >
          {/* Step 1: Pick Module */}
          <SwiperSlide>
            <div className="text-center">
              <h2 className="mb-6 font-display text-xl font-semibold">Pick Module</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`
                      block w-full p-4 rounded-xl text-left transition-all duration-200
                      ${
                        selectedModule?.id === module.id
                          ? "bg-signal/30 border-2 border-signal text-white"
                          : "bg-panel hover:bg-panel/80 border-2 border-transparent"
                      }
                    `}
                  >
                    <div className="font-medium">{module.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{module.layer.toUpperCase()} Layer</div>
                  </button>
                ))}
              </div>
            </div>
          </SwiperSlide>

          {/* Step 2: Deliverable */}
          <SwiperSlide>
            <div className="text-center">
              <h2 className="mb-6 font-display text-xl font-semibold">Define Deliverable</h2>
              <div className="space-y-4">
                <textarea
                  value={deliverable}
                  onChange={(e) => setDeliverable(e.target.value)}
                  className="w-full p-4 bg-panel rounded-xl border border-signal/20 focus:border-signal focus:outline-none resize-none"
                  placeholder="e.g. Complete landing page redesign with mobile optimization"
                  rows={4}
                />
                <p className="text-sm text-gray-400">Describe what you'll deliver at the end of this sprint</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Step 3: Length */}
          <SwiperSlide>
            <div className="text-center">
              <h2 className="mb-6 font-display text-xl font-semibold">Sprint Length</h2>
              <div className="space-y-6">
                <input
                  type="range"
                  min={3}
                  max={30}
                  value={lengthDays}
                  onChange={(e) => setLengthDays(+e.target.value)}
                  className="w-full h-2 bg-panel rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center">
                  <div className="text-4xl font-bold text-signal mb-2">{lengthDays}</div>
                  <div className="text-gray-400">days</div>
                </div>
                <div className="text-sm text-gray-400">Recommended: 7-14 days for optimal focus</div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentSlide < 2 ? (
            <button
              onClick={nextSlide}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-signal hover:bg-signal/80 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleStartSprint}
              disabled={!selectedModule || !deliverable}
              className="px-8 py-3 bg-gradient-to-r from-signal to-purple-500 hover:from-signal/90 hover:to-purple-500/90 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Start Sprint
            </button>
          )}
        </div>

        {/* Cancel */}
        <div className="text-center mt-6">
          <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white transition-colors text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

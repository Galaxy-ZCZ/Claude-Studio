import { useState, useEffect, useRef, useCallback } from 'react'

type PetState = 'idle' | 'walking' | 'sleeping' | 'playing' | 'eating' | 'happy'

export default function DesktopPet() {
  const [position, setPosition] = useState({ x: window.innerWidth - 150, y: window.innerHeight - 200 })
  const [state, setState] = useState<PetState>('idle')
  const [direction, setDirection] = useState<'left' | 'right'>('left')
  const [showMenu, setShowMenu] = useState(false)
  const [mood, setMood] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  const petRef = useRef<HTMLDivElement>(null)
  const stateTimerRef = useRef<NodeJS.Timeout>()
  const walkTimerRef = useRef<NodeJS.Timeout>()
  const bubbleTimerRef = useRef<NodeJS.Timeout>()

  // Pet messages
  const messages = {
    idle: ['Meow~', 'Pet me!', '...', '*yawn*', 'I\'m bored~'],
    walking: ['Where to?', 'Exploring~', 'Let\'s go!'],
    sleeping: ['Zzz...', '*snore*', 'So sleepy...'],
    happy: ['Purrrr~', 'I love you!', '*happy cat noises*', '❤️'],
    code: ['Need help?', 'Nice code!', 'I see bugs~', 'Ctrl+S!'],
  }

  // Random bubble text
  const showBubble = useCallback((text?: string) => {
    const msg = text || messages.idle[Math.floor(Math.random() * messages.idle.length)]
    setBubbleText(msg)
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => setBubbleText(null), 3000)
  }, [])

  // Idle behavior
  useEffect(() => {
    const idleBehavior = () => {
      if (isDragging) return

      const rand = Math.random()
      if (rand < 0.3) {
        // Random walk
        setState('walking')
        const targetX = Math.max(50, Math.min(window.innerWidth - 100, position.x + (Math.random() - 0.5) * 200))
        const targetY = Math.max(50, Math.min(window.innerHeight - 150, position.y + (Math.random() - 0.5) * 100))
        setDirection(targetX > position.x ? 'right' : 'left')

        // Animate walk
        const steps = 20
        const dx = (targetX - position.x) / steps
        const dy = (targetY - position.y) / steps
        let step = 0

        walkTimerRef.current = setInterval(() => {
          step++
          setPosition(prev => ({
            x: prev.x + dx,
            y: prev.y + dy,
          }))
          if (step >= steps) {
            if (walkTimerRef.current) clearInterval(walkTimerRef.current)
            setState('idle')
          }
        }, 50)
      } else if (rand < 0.5) {
        // Random message
        showBubble()
      } else if (rand < 0.7) {
        // Sleep
        setState('sleeping')
        setTimeout(() => setState('idle'), 5000)
      }
    }

    stateTimerRef.current = setInterval(idleBehavior, 4000)
    return () => {
      if (stateTimerRef.current) clearInterval(stateTimerRef.current)
      if (walkTimerRef.current) clearInterval(walkTimerRef.current)
    }
  }, [position, isDragging, showBubble])

  // Decrease mood over time
  useEffect(() => {
    const moodTimer = setInterval(() => {
      setMood(prev => Math.max(0, prev - 1))
    }, 60000)
    return () => clearInterval(moodTimer)
  }, [])

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    setState('happy')
    showBubble('Wheee~!')
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y)),
      })
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setState('idle')
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  // Pet actions
  const handlePet = () => {
    setMood(prev => Math.min(100, prev + 10))
    setState('happy')
    showBubble('Purrrr~ ❤️')
    setTimeout(() => setState('idle'), 2000)
  }

  const handleFeed = () => {
    setState('eating')
    showBubble('Yummy! 🐟')
    setMood(prev => Math.min(100, prev + 20))
    setTimeout(() => setState('idle'), 3000)
  }

  const handlePlay = () => {
    setState('playing')
    showBubble('Let\'s play! 🎮')
    setMood(prev => Math.min(100, prev + 15))
    setTimeout(() => setState('idle'), 3000)
  }

  // Get cat SVG based on state
  const getCatSVG = () => {
    const eyeColor = state === 'sleeping' ? '#484f58' : '#3fb950'
    const mouthColor = state === 'happy' ? '#f85149' : '#e6edf3'
    const tailAngle = state === 'walking' ? 'rotate(-30 65 55)' : state === 'happy' ? 'rotate(20 65 55)' : 'rotate(0 65 55)'

    return (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="40" cy="50" rx="20" ry="15" fill="#ffa657" />
        <ellipse cx="40" cy="50" rx="18" ry="13" fill="#ffc078" />

        {/* Head */}
        <circle cx="40" cy="30" r="15" fill="#ffa657" />
        <circle cx="40" cy="30" r="13" fill="#ffc078" />

        {/* Ears */}
        <polygon points="28,20 25,8 35,18" fill="#ffa657" />
        <polygon points="52,20 55,8 45,18" fill="#ffa657" />
        <polygon points="30,18 28,10 34,17" fill="#ffb366" />
        <polygon points="50,18 52,10 46,17" fill="#ffb366" />

        {/* Eyes */}
        {state === 'sleeping' ? (
          <>
            <path d="M32 28 Q35 30 38 28" stroke="#484f58" strokeWidth="2" fill="none" />
            <path d="M42 28 Q45 30 48 28" stroke="#484f58" strokeWidth="2" fill="none" />
          </>
        ) : (
          <>
            <circle cx="34" cy="28" r="3" fill={eyeColor} />
            <circle cx="46" cy="28" r="3" fill={eyeColor} />
            <circle cx="35" cy="27" r="1" fill="white" />
            <circle cx="47" cy="27" r="1" fill="white" />
          </>
        )}

        {/* Nose */}
        <ellipse cx="40" cy="33" rx="2" ry="1.5" fill="#f85149" />

        {/* Mouth */}
        {state === 'happy' ? (
          <path d="M36 35 Q40 38 44 35" stroke={mouthColor} strokeWidth="1.5" fill="none" />
        ) : (
          <path d="M37 35 L40 36 L43 35" stroke="#8b949e" strokeWidth="1" fill="none" />
        )}

        {/* Whiskers */}
        <line x1="20" y1="30" x2="30" y2="32" stroke="#8b949e" strokeWidth="0.5" />
        <line x1="20" y1="33" x2="30" y2="33" stroke="#8b949e" strokeWidth="0.5" />
        <line x1="50" y1="32" x2="60" y2="30" stroke="#8b949e" strokeWidth="0.5" />
        <line x1="50" y1="33" x2="60" y2="33" stroke="#8b949e" strokeWidth="0.5" />

        {/* Tail */}
        <g transform={tailAngle} style={{ transformOrigin: '65px 55px', transition: 'transform 0.3s' }}>
          <path d="M55 55 Q65 45 70 55 Q75 65 65 60" stroke="#ffa657" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>

        {/* Paws */}
        <ellipse cx="30" cy="60" rx="5" ry="3" fill="#ffa657" />
        <ellipse cx="50" cy="60" rx="5" ry="3" fill="#ffa657" />

        {/* Walking animation */}
        {state === 'walking' && (
          <>
            <ellipse cx="30" cy="60" rx="5" ry="3" fill="#ffa657">
              <animate attributeName="cy" values="60;58;60" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="50" cy="60" rx="5" ry="3" fill="#ffa657">
              <animate attributeName="cy" values="58;60;58" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
          </>
        )}

        {/* Sleeping Zzz */}
        {state === 'sleeping' && (
          <text x="55" y="15" fill="#58a6ff" fontSize="10" fontWeight="bold">
            Z
            <animate attributeName="y" values="15;10;15" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
          </text>
        )}

        {/* Happy hearts */}
        {state === 'happy' && (
          <>
            <text x="60" y="15" fill="#f85149" fontSize="8">❤</text>
            <text x="55" y="10" fill="#f85149" fontSize="6">
              ❤
              <animate attributeName="y" values="10;5;10" dur="1s" repeatCount="indefinite" />
            </text>
          </>
        )}

        {/* Eating animation */}
        {state === 'eating' && (
          <text x="55" y="25" fill="#ffa657" fontSize="10">
            🐟
            <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="3" />
          </text>
        )}
      </svg>
    )
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 bg-[#161b22] border border-[#30363d] rounded-full p-2 hover:bg-[#30363d] transition-colors shadow-lg"
        title="Show pet"
      >
        <span className="text-xl">🐱</span>
      </button>
    )
  }

  return (
    <>
      {/* Pet */}
      <div
        ref={petRef}
        className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
        style={{
          left: position.x,
          top: position.y,
          transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          transition: isDragging ? 'none' : 'left 0.05s linear, top 0.05s linear',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handlePet}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
      >
        {/* Speech bubble */}
        {bubbleText && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg"
            style={{ transform: `scaleX(${direction === 'left' ? -1 : 1}) translateX(50%)` }}
          >
            {bubbleText}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#161b22] border-r border-b border-[#30363d] rotate-45" />
          </div>
        )}

        {/* Cat */}
        {getCatSVG()}

        {/* Minimize button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsMinimized(true)
          }}
          className="absolute -top-2 -right-2 w-4 h-4 bg-[#30363d] rounded-full text-[8px] flex items-center justify-center hover:bg-[#484f58] opacity-0 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div
          className="fixed z-50 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl py-1 min-w-[120px]"
          style={{ left: position.x + 40, top: position.y }}
          onClick={() => setShowMenu(false)}
        >
          <button
            onClick={handlePet}
            className="w-full text-left px-3 py-1.5 text-xs text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-2"
          >
            <span>🤚</span> Pet
          </button>
          <button
            onClick={handleFeed}
            className="w-full text-left px-3 py-1.5 text-xs text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-2"
          >
            <span>🐟</span> Feed
          </button>
          <button
            onClick={handlePlay}
            className="w-full text-left px-3 py-1.5 text-xs text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-2"
          >
            <span>🎮</span> Play
          </button>
          <div className="border-t border-[#30363d] my-1" />
          <button
            onClick={() => showBubble()}
            className="w-full text-left px-3 py-1.5 text-xs text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-2"
          >
            <span>💬</span> Talk
          </button>
          <div className="border-t border-[#30363d] my-1" />
          <button
            onClick={() => setIsMinimized(true)}
            className="w-full text-left px-3 py-1.5 text-xs text-[#8b949e] hover:bg-[#30363d] flex items-center gap-2"
          >
            <span>🙈</span> Hide
          </button>
        </div>
      )}

      {/* Mood indicator */}
      <div className="fixed bottom-4 right-4 z-40 bg-[#161b22] border border-[#30363d] rounded-lg px-2 py-1 text-[10px] text-[#484f58]">
        <div className="flex items-center gap-1.5">
          <span>Mood</span>
          <div className="w-16 h-1.5 bg-[#30363d] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${mood}%`,
                backgroundColor: mood > 60 ? '#3fb950' : mood > 30 ? '#d29922' : '#f85149',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

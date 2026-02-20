import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { format, nextDay, startOfDay, addDays } from 'date-fns'
import './App.css'

const MAX_PLAYERS = 20

// Get the next occurrence of a given weekday (0=Sun, 1=Mon...6=Sat)
// Change GAME_DAY to whatever day your pickup game is on
const GAME_DAY = 3 // Wednesday

function getNextGameDate() {
  const today = startOfDay(new Date())
  const todayDay = today.getDay()
  const daysUntil = (GAME_DAY - todayDay + 7) % 7
  return daysUntil === 0 ? today : addDays(today, daysUntil)
}

export default function App() {
  const [players, setPlayers] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [myEntry, setMyEntry] = useState(null)

  const gameDate = getNextGameDate()
  const gameDateStr = format(gameDate, 'yyyy-MM-dd')
  const spotsLeft = Math.max(0, MAX_PLAYERS - players.length)

  useEffect(() => {
    fetchPlayers()

    // Real-time subscription
    const channel = supabase
      .channel('rsvps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
        fetchPlayers()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [gameDateStr])

  async function fetchPlayers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('game_date', gameDateStr)
      .order('created_at', { ascending: true })

    if (!error) {
      setPlayers(data || [])
      // Check if the user's name (stored in localStorage) is already signed up
      const savedName = localStorage.getItem('ultimate_name')
      if (savedName) {
        setName(savedName)
        const existing = (data || []).find(p => p.name.toLowerCase() === savedName.toLowerCase())
        setMyEntry(existing || null)
      }
    }
    setLoading(false)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError('')

    const trimmedName = name.trim()

    // Check if name already exists
    const existing = players.find(p => p.name.toLowerCase() === trimmedName.toLowerCase())
    if (existing) {
      setError('That name is already signed up!')
      setSubmitting(false)
      return
    }

    if (players.length >= MAX_PLAYERS) {
      setError('Game is full! You\'ve been added to the waitlist.')
    }

    const { data, error: insertError } = await supabase
      .from('rsvps')
      .insert([{ name: trimmedName, game_date: gameDateStr }])
      .select()
      .single()

    if (insertError) {
      setError('Something went wrong. Try again!')
    } else {
      localStorage.setItem('ultimate_name', trimmedName)
      setMyEntry(data)
      fetchPlayers()
    }
    setSubmitting(false)
  }

  async function handleDropOut() {
    if (!myEntry) return
    setSubmitting(true)

    const { error: deleteError } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', myEntry.id)

    if (!deleteError) {
      setMyEntry(null)
      fetchPlayers()
    }
    setSubmitting(false)
  }

  const confirmed = players.slice(0, MAX_PLAYERS)
  const waitlist = players.slice(MAX_PLAYERS)
  const myPosition = players.findIndex(p => myEntry && p.id === myEntry.id)
  const onWaitlist = myPosition >= MAX_PLAYERS

  return (
    <div className="app">
      <div className="noise" />

      <header className="header">
        <div className="disc-icon">🥏</div>
        <h1 className="title">pickup</h1>
        <p className="subtitle">weekly ultimate</p>
      </header>

      <div className="game-info">
        <div className="game-date-card">
          <span className="game-label">next game</span>
          <span className="game-date">{format(gameDate, 'EEEE, MMMM d')}</span>
        </div>
        <div className="spots-badge" data-full={spotsLeft === 0}>
          {spotsLeft === 0 ? 'FULL' : `${spotsLeft} spots left`}
        </div>
      </div>

      <div className="rsvp-section">
        {!myEntry ? (
          <form onSubmit={handleSignUp} className="signup-form">
            <input
              className="name-input"
              type="text"
              placeholder="your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              autoCapitalize="words"
            />
            <button
              className="btn-join"
              type="submit"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'joining...' : "i'm in"}
            </button>
            {error && <p className="error-msg">{error}</p>}
          </form>
        ) : (
          <div className="my-status">
            {onWaitlist ? (
              <div className="status-badge waitlist">
                waitlist #{myPosition - MAX_PLAYERS + 1}
              </div>
            ) : (
              <div className="status-badge confirmed">
                ✓ you're in, {myEntry.name.split(' ')[0]}!
              </div>
            )}
            <button
              className="btn-dropout"
              onClick={handleDropOut}
              disabled={submitting}
            >
              can't make it
            </button>
          </div>
        )}
      </div>

      <div className="players-section">
        <div className="players-list">
          <h2 className="list-title">
            playing <span className="count">{confirmed.length}/{MAX_PLAYERS}</span>
          </h2>
          {loading ? (
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          ) : confirmed.length === 0 ? (
            <p className="empty-msg">no one yet — be the first!</p>
          ) : (
            <ol className="player-ol">
              {confirmed.map((p, i) => (
                <li key={p.id} className={`player-item ${myEntry && p.id === myEntry.id ? 'is-me' : ''}`}>
                  <span className="player-num">{i + 1}</span>
                  <span className="player-name">{p.name}</span>
                  {myEntry && p.id === myEntry.id && <span className="you-tag">you</span>}
                </li>
              ))}
            </ol>
          )}
        </div>

        {waitlist.length > 0 && (
          <div className="waitlist-section">
            <h2 className="list-title">waitlist</h2>
            <ol className="player-ol waitlist-ol">
              {waitlist.map((p, i) => (
                <li key={p.id} className={`player-item waitlisted ${myEntry && p.id === myEntry.id ? 'is-me' : ''}`}>
                  <span className="player-num">{i + 1}</span>
                  <span className="player-name">{p.name}</span>
                  {myEntry && p.id === myEntry.id && <span className="you-tag">you</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <footer className="footer">
        share the link with your crew
      </footer>
    </div>
  )
}

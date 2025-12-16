import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import WaveSurfer from 'wavesurfer.js'
import Slider from 'rc-slider'

export default function CrossCheckList({ userId }: { userId: number | null }) {
const [items, setItems] = useState<any[]>([])
useEffect(()=>{ if(userId) fetchToCheck() }, [userId])

async function fetchToCheck(){
    const resp = await axios.get(`/sentence/to-check/${userId}`)
    setItems(resp.data.sentences || [])
}

return (
    <div className="grid gap-4">
        {items.map((s, idx)=> (<CrossCheckItem key={s.id} sentence={s} userId={userId} />))}
    </div>
)}


function CrossCheckItem({ sentence, userId }: any) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const waveRef = useRef<any>(null)
    const [range, setRange] = useState<[number, number]>([0,1])
    const [audioUrl, setAudioUrl] = useState<string | null>(null)

    useEffect(()=>{
        // fetch a short sample audio for sentence (from backend)
        const url = `/storage/sent_sample_${sentence.id}.webm`
        setAudioUrl(url)
        if(containerRef.current){
            if(waveRef.current) waveRef.current.destroy()
                waveRef.current = WaveSurfer.create({ container: containerRef.current, waveColor: '#f97316', progressColor: '#fb923c' })
                waveRef.current.load(url)
                waveRef.current.on('ready', ()=> setRange([0, waveRef.current.getDuration()]))
        }
    }, [])

    const submit = async ()=>{
        await axios.post('/cross/add', { sentence_id: sentence.id, user_id: userId, start: range[0], end: range[1] })
        alert('Cảm ơn, đã gửi kiểm tra')
    }

    return (
        <div className="p-3 bg-white rounded shadow-sm">
        <div className="font-medium mb-1">{sentence.text}</div>
        <div ref={containerRef} className="h-20 mb-2 bg-slate-50" />
        <Slider range min={0} max={range[1] || 30} value={range} onChange={(v:any)=>setRange(v)} />
            <div className="flex justify-between mt-2">
            <div>Start: {range[0].toFixed(2)}s</div>
            <div>End: {range[1].toFixed(2)}s</div>
                <button onClick={submit} className="bg-indigo-600 text-white px-3 py-1 rounded">Gửi</button>
            </div>
        </div>
    )
}
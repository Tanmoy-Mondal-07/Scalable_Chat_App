"use client"

import { useParams } from 'next/navigation'
import React from 'react'

function page() {
    const prams = useParams<{ id: string }>()
  return (
    <div>message to :: {prams.id}</div>
  )
}

export default page
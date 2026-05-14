import { HomeContent } from '@/components/HomeContent'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[640px]">
        <HomeContent />
      </div>
    </main>
  )
}

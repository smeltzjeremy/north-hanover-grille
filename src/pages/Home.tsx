import type { SiteData } from '@shared/types'
import HeaderDock from '../components/HeaderDock'
import HeroHub from '../components/HeroHub'
import TuesdayWings from '../components/TuesdayWings'
import TapGrid from '../components/TapGrid'
import MenuDeck from '../components/MenuDeck'
import BanquetCard from '../components/BanquetCard'
import Footer from '../components/Footer'

export default function Home({ data }: { data: SiteData }) {
  return (
    <div className="pb-8">
      <HeaderDock data={data} />
      <HeroHub data={data} />
      <TuesdayWings data={data} />
      <TapGrid data={data} />
      <MenuDeck data={data} />
      <BanquetCard data={data} />
      <Footer data={data} />
    </div>
  )
}


import Image from 'next/image';
import logo from '../public/logo.svg'
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const menuItem= [
  {name:'Home',link:'./link'},
  {name:'Pricing',link:'./pricing'},
  {name:'Contact us',link:'./contact-us'},
]
const Header = () => {
  return (
    <div className='flex  justify-between p-4'>
      <div className='flex gap-2 items-center'>
        <Image src={logo} height={40} width={40} alt="logo"/>
        <h2 className='font-bold text-2xl'>AI Trip Planner</h2>
      </div>
      <ul className='flex gap-4 items-center'>
         {menuItem.map((item,index) =>
           <Link key={index} href={item.link} className='hover:text-amber-500'>{item.name}</Link>
         )}
      </ul>
      <Button>Get Started</Button>
    </div>
  )
}

export default Header;
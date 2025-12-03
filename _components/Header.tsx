'use client'

import Image from 'next/image';
import logo from '../public/logo.svg'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const menuItem= [
  {name:'Home',link:'./link'},
  {name:'Pricing',link:'./pricing'},
  {name:'Contact us',link:'./contact-us'},
]
const Header = () => {

  const router= useRouter();
 
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
      <div className='flex gap-4'>
          <Button onClick={()=>router.push('/my-trips')} className='bg-blue-500 cursor-pointer'>My Trips</Button>
          <Button className='cursor-pointer' onClick={()=>router.push('/create-new-trip')}>Get Started</Button>
      </div>
      
    </div>
  )
}

export default Header;
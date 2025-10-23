'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentModal } from '@/components/payment-modal'
import { MapPin, DollarSign, Calendar, User, ShoppingCart, CheckCircle } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'
import { usePurchasedLands } from '@/contexts/purchased-lands-context'
import { useWalletContext } from '@/contexts/wallet-context'
import { toast } from 'sonner'

interface LandListing {
  id: string
  title: string
  description: string
  price: string
  area: string
  location: string
  seller: string
  sellerName: string
  listedDate: string
  imageUrl?: string
}

export function LandMarketplace() {
  const { addPurchasedLand, isLandPurchased } = usePurchasedLands()
  const { account } = useWalletContext()
  const [listings, setListings] = useState<LandListing[]>([
    {
      id: 'LAND001',
      title: 'Agricultural Plot - Sector 12',
      description: 'Prime agricultural land with excellent soil quality and irrigation facilities. Perfect for farming or development.',
      price: '0',
      area: '2.5 acres',
      location: 'Delhi, India',
      seller: '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
      sellerName: 'Rajesh Kumar',
      listedDate: '2024-01-15',
    },
    {
      id: 'LAND002',
      title: 'Residential Plot - Block A',
      description: 'Well-located residential plot in a developing area with good connectivity and amenities nearby.',
      price: '0',
      area: '0.75 acres',
      location: 'Mumbai, India',
      seller: '0x8a3b8D0C4C4C4C4C4C4C4C4C4C4C4C4C4C4C4C4C4',
      sellerName: 'Priya Sharma',
      listedDate: '2024-01-20',
    },
    {
      id: 'LAND003',
      title: 'Commercial Land - IT Hub',
      description: 'Strategic commercial land in the heart of the IT district, perfect for office buildings or tech parks.',
      price: '0',
      area: '1.2 acres',
      location: 'Bangalore, India',
      seller: '0x9b4c5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3',
      sellerName: 'Amit Patel',
      listedDate: '2024-01-25',
    },
    {
      id: 'LAND004',
      title: 'Industrial Plot - Zone 3',
      description: 'Large industrial plot with excellent transport connectivity and utilities infrastructure.',
      price: '0',
      area: '5.0 acres',
      location: 'Chennai, India',
      seller: '0x1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1',
      sellerName: 'Suresh Reddy',
      listedDate: '2024-02-01',
    },
    {
      id: 'LAND005',
      title: 'Farmland - Organic Zone',
      description: 'Certified organic farmland with sustainable farming practices and water conservation systems.',
      price: '0',
      area: '3.8 acres',
      location: 'Pune, India',
      seller: '0x2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2',
      sellerName: 'Meera Singh',
      listedDate: '2024-02-05',
    },
    {
      id: 'LAND006',
      title: 'Residential Plot - Green Valley',
      description: 'Eco-friendly residential plot with natural surroundings and modern amenities.',
      price: '0',
      area: '1.5 acres',
      location: 'Hyderabad, India',
      seller: '0x3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3',
      sellerName: 'Vikram Rao',
      listedDate: '2024-02-10',
    },
    {
      id: 'LAND007',
      title: 'Commercial Space - Mall District',
      description: 'Prime commercial land in a bustling mall district with high foot traffic and visibility.',
      price: '0',
      area: '0.9 acres',
      location: 'Kolkata, India',
      seller: '0x4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4',
      sellerName: 'Rita Das',
      listedDate: '2024-02-15',
    },
    {
      id: 'LAND008',
      title: 'Agricultural Land - River Valley',
      description: 'Fertile agricultural land near river with natural irrigation and rich soil.',
      price: '0',
      area: '4.2 acres',
      location: 'Ahmedabad, India',
      seller: '0x5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5',
      sellerName: 'Harsh Shah',
      listedDate: '2024-02-20',
    },
    {
      id: 'LAND009',
      title: 'Residential Plot - Hillside',
      description: 'Scenic residential plot with panoramic views and peaceful environment.',
      price: '0',
      area: '1.1 acres',
      location: 'Shimla, India',
      seller: '0x6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6',
      sellerName: 'Anita Verma',
      listedDate: '2024-02-25',
    },
    {
      id: 'LAND010',
      title: 'Industrial Land - Port Area',
      description: 'Strategic industrial land near port with excellent logistics connectivity.',
      price: '0',
      area: '6.5 acres',
      location: 'Kochi, India',
      seller: '0x7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7',
      sellerName: 'Rajesh Nair',
      listedDate: '2024-03-01',
    },
    // Chennai Properties (TN-CHN-2001 to TN-CHN-2020)
    {
      id: 'TN-CHN-2001',
      title: 'Chennai IT Corridor - Phase 1',
      description: 'Premium commercial land in Chennai IT corridor with excellent connectivity to airport and city center.',
      price: '0',
      area: '2.3 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
      sellerName: 'Karthik Raman',
      listedDate: '2024-03-05',
    },
    {
      id: 'TN-CHN-2002',
      title: 'Chennai Marina Beach Plot',
      description: 'Exclusive beachfront property with stunning sea views and premium location.',
      price: '0',
      area: '0.8 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
      sellerName: 'Lakshmi Priya',
      listedDate: '2024-03-10',
    },
    {
      id: 'TN-CHN-2003',
      title: 'Chennai Industrial Estate',
      description: 'Large industrial plot in Chennai industrial estate with all utilities and transport links.',
      price: '0',
      area: '7.2 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0',
      sellerName: 'Senthil Kumar',
      listedDate: '2024-03-15',
    },
    {
      id: 'TN-CHN-2004',
      title: 'Chennai Residential Complex',
      description: 'Modern residential plot in planned township with all amenities and security.',
      price: '0',
      area: '1.4 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1',
      sellerName: 'Deepa Rajan',
      listedDate: '2024-03-20',
    },
    {
      id: 'TN-CHN-2005',
      title: 'Chennai Agricultural Farm',
      description: 'Fertile agricultural land with irrigation facilities and organic farming potential.',
      price: '0',
      area: '5.6 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2',
      sellerName: 'Ravi Krishnan',
      listedDate: '2024-03-25',
    },
    {
      id: 'TN-CHN-2006',
      title: 'Chennai Tech Park Land',
      description: 'Strategic land for tech park development with excellent infrastructure.',
      price: '0',
      area: '3.1 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3',
      sellerName: 'Priya Sundaram',
      listedDate: '2024-03-30',
    },
    {
      id: 'TN-CHN-2007',
      title: 'Chennai Port Land',
      description: 'Commercial land near Chennai port with excellent logistics connectivity.',
      price: '0',
      area: '4.7 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4',
      sellerName: 'Manoj Kumar',
      listedDate: '2024-04-05',
    },
    {
      id: 'TN-CHN-2008',
      title: 'Chennai Educational Hub',
      description: 'Land suitable for educational institutions with good connectivity to city.',
      price: '0',
      area: '2.8 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5',
      sellerName: 'Dr. Anitha Rao',
      listedDate: '2024-04-10',
    },
    {
      id: 'TN-CHN-2009',
      title: 'Chennai Healthcare District',
      description: 'Prime land for healthcare facilities with excellent access to medical infrastructure.',
      price: '0',
      area: '1.9 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6',
      sellerName: 'Dr. Venkat Raman',
      listedDate: '2024-04-15',
    },
    {
      id: 'TN-CHN-2010',
      title: 'Chennai Retail Hub',
      description: 'Commercial land in high-traffic retail area with excellent visibility.',
      price: '0',
      area: '0.6 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7',
      sellerName: 'Shanti Devi',
      listedDate: '2024-04-20',
    },
    {
      id: 'TN-CHN-2011',
      title: 'Chennai Logistics Park',
      description: 'Large logistics facility land with excellent transport connectivity.',
      price: '0',
      area: '8.3 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8',
      sellerName: 'Logistics Solutions Ltd',
      listedDate: '2024-04-25',
    },
    {
      id: 'TN-CHN-2012',
      title: 'Chennai Residential Township',
      description: 'Planned residential development with modern amenities and green spaces.',
      price: '0',
      area: '6.4 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9',
      sellerName: 'Township Developers',
      listedDate: '2024-04-30',
    },
    {
      id: 'TN-CHN-2013',
      title: 'Chennai Manufacturing Zone',
      description: 'Industrial land for manufacturing units with all necessary approvals.',
      price: '0',
      area: '9.1 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0',
      sellerName: 'Manufacturing Corp',
      listedDate: '2024-05-05',
    },
    {
      id: 'TN-CHN-2014',
      title: 'Chennai Entertainment District',
      description: 'Land for entertainment and leisure facilities with high footfall potential.',
      price: '0',
      area: '2.5 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1',
      sellerName: 'Entertainment Group',
      listedDate: '2024-05-10',
    },
    {
      id: 'TN-CHN-2015',
      title: 'Chennai Research Center',
      description: 'Land for research and development facilities with excellent infrastructure.',
      price: '0',
      area: '3.7 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2',
      sellerName: 'Research Foundation',
      listedDate: '2024-05-15',
    },
    {
      id: 'TN-CHN-2016',
      title: 'Chennai Sports Complex',
      description: 'Land for sports and recreational facilities with excellent access.',
      price: '0',
      area: '4.2 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3',
      sellerName: 'Sports Authority',
      listedDate: '2024-05-20',
    },
    {
      id: 'TN-CHN-2017',
      title: 'Chennai Convention Center',
      description: 'Land for convention and conference facilities in prime location.',
      price: '0',
      area: '2.9 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4',
      sellerName: 'Convention Services',
      listedDate: '2024-05-25',
    },
    {
      id: 'TN-CHN-2018',
      title: 'Chennai Data Center',
      description: 'Secure land for data center facilities with excellent connectivity.',
      price: '0',
      area: '1.6 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5',
      sellerName: 'Data Solutions Inc',
      listedDate: '2024-05-30',
    },
    {
      id: 'TN-CHN-2019',
      title: 'Chennai Startup Hub',
      description: 'Land for startup incubator and co-working spaces.',
      price: '0',
      area: '1.8 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6',
      sellerName: 'Startup Ecosystem',
      listedDate: '2024-06-05',
    },
    {
      id: 'TN-CHN-2020',
      title: 'Chennai Green Energy Park',
      description: 'Land for renewable energy projects and green technology.',
      price: '0',
      area: '5.3 acres',
      location: 'Chennai, Tamil Nadu',
      seller: '0x7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7',
      sellerName: 'Green Energy Corp',
      listedDate: '2024-06-10',
    },
    // Bengaluru Properties (KA-BLR-1004 to KA-BLR-1050)
    {
      id: 'KA-BLR-1004',
      title: 'Bengaluru IT Park - Phase 2',
      description: 'Premium IT park land with excellent connectivity and modern infrastructure.',
      price: '0',
      area: '3.2 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8',
      sellerName: 'Tech Park Developers',
      listedDate: '2024-06-15',
    },
    {
      id: 'KA-BLR-1005',
      title: 'Bengaluru Residential Complex',
      description: 'Modern residential development with luxury amenities and security.',
      price: '0',
      area: '4.5 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9',
      sellerName: 'Luxury Homes Ltd',
      listedDate: '2024-06-20',
    },
    {
      id: 'KA-BLR-1006',
      title: 'Bengaluru Industrial Estate',
      description: 'Large industrial plot with all utilities and excellent transport links.',
      price: '0',
      area: '7.8 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0',
      sellerName: 'Industrial Solutions',
      listedDate: '2024-06-25',
    },
    {
      id: 'KA-BLR-1007',
      title: 'Bengaluru Commercial Hub',
      description: 'Prime commercial land in central business district.',
      price: '0',
      area: '1.2 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1',
      sellerName: 'Commercial Realty',
      listedDate: '2024-06-30',
    },
    {
      id: 'KA-BLR-1008',
      title: 'Bengaluru Educational Campus',
      description: 'Land for educational institutions with excellent infrastructure.',
      price: '0',
      area: '6.3 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2',
      sellerName: 'Education Trust',
      listedDate: '2024-07-05',
    },
    {
      id: 'KA-BLR-1009',
      title: 'Bengaluru Healthcare District',
      description: 'Land for healthcare facilities with excellent medical infrastructure.',
      price: '0',
      area: '2.7 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3',
      sellerName: 'Healthcare Group',
      listedDate: '2024-07-10',
    },
    {
      id: 'KA-BLR-1010',
      title: 'Bengaluru Logistics Park',
      description: 'Strategic logistics facility with excellent connectivity.',
      price: '0',
      area: '9.4 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4',
      sellerName: 'Logistics Solutions',
      listedDate: '2024-07-15',
    },
    {
      id: 'KA-BLR-1011',
      title: 'Bengaluru Startup Incubator',
      description: 'Land for startup incubator and innovation center.',
      price: '0',
      area: '2.1 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5',
      sellerName: 'Innovation Hub',
      listedDate: '2024-07-20',
    },
    {
      id: 'KA-BLR-1012',
      title: 'Bengaluru Research Center',
      description: 'Land for research and development facilities.',
      price: '0',
      area: '3.6 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6',
      sellerName: 'Research Institute',
      listedDate: '2024-07-25',
    },
    {
      id: 'KA-BLR-1013',
      title: 'Bengaluru Sports Complex',
      description: 'Land for sports and recreational facilities.',
      price: '0',
      area: '5.2 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7',
      sellerName: 'Sports Foundation',
      listedDate: '2024-07-30',
    },
    {
      id: 'KA-BLR-1014',
      title: 'Bengaluru Convention Center',
      description: 'Land for convention and conference facilities.',
      price: '0',
      area: '2.8 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
      sellerName: 'Convention Services',
      listedDate: '2024-08-05',
    },
    {
      id: 'KA-BLR-1015',
      title: 'Bengaluru Data Center',
      description: 'Secure land for data center facilities.',
      price: '0',
      area: '1.9 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
      sellerName: 'Data Solutions',
      listedDate: '2024-08-10',
    },
    {
      id: 'KA-BLR-1016',
      title: 'Bengaluru Green Energy Park',
      description: 'Land for renewable energy projects.',
      price: '0',
      area: '4.7 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0',
      sellerName: 'Green Energy Corp',
      listedDate: '2024-08-15',
    },
    {
      id: 'KA-BLR-1017',
      title: 'Bengaluru Entertainment District',
      description: 'Land for entertainment and leisure facilities.',
      price: '0',
      area: '3.4 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1',
      sellerName: 'Entertainment Group',
      listedDate: '2024-08-20',
    },
    {
      id: 'KA-BLR-1018',
      title: 'Bengaluru Manufacturing Zone',
      description: 'Industrial land for manufacturing units.',
      price: '0',
      area: '8.6 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2',
      sellerName: 'Manufacturing Corp',
      listedDate: '2024-08-25',
    },
    {
      id: 'KA-BLR-1019',
      title: 'Bengaluru Retail Hub',
      description: 'Commercial land in high-traffic retail area.',
      price: '0',
      area: '0.9 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3',
      sellerName: 'Retail Solutions',
      listedDate: '2024-08-30',
    },
    {
      id: 'KA-BLR-1020',
      title: 'Bengaluru Residential Township',
      description: 'Planned residential development with modern amenities.',
      price: '0',
      area: '7.1 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4',
      sellerName: 'Township Developers',
      listedDate: '2024-09-05',
    },
    {
      id: 'KA-BLR-1021',
      title: 'Bengaluru Tech Campus',
      description: 'Land for technology campus with excellent infrastructure.',
      price: '0',
      area: '5.8 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5',
      sellerName: 'Tech Campus Ltd',
      listedDate: '2024-09-10',
    },
    {
      id: 'KA-BLR-1022',
      title: 'Bengaluru Innovation Park',
      description: 'Land for innovation and technology development.',
      price: '0',
      area: '4.3 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6',
      sellerName: 'Innovation Park',
      listedDate: '2024-09-15',
    },
    {
      id: 'KA-BLR-1023',
      title: 'Bengaluru Business Center',
      description: 'Land for business center and corporate offices.',
      price: '0',
      area: '2.4 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7',
      sellerName: 'Business Center',
      listedDate: '2024-09-20',
    },
    {
      id: 'KA-BLR-1024',
      title: 'Bengaluru Cultural Center',
      description: 'Land for cultural and arts facilities.',
      price: '0',
      area: '1.7 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8',
      sellerName: 'Cultural Foundation',
      listedDate: '2024-09-25',
    },
    {
      id: 'KA-BLR-1025',
      title: 'Bengaluru Medical Hub',
      description: 'Land for medical facilities and healthcare services.',
      price: '0',
      area: '3.9 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9',
      sellerName: 'Medical Services',
      listedDate: '2024-09-30',
    },
    {
      id: 'KA-BLR-1026',
      title: 'Bengaluru Educational Hub',
      description: 'Land for educational institutions and training centers.',
      price: '0',
      area: '6.7 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0',
      sellerName: 'Education Group',
      listedDate: '2024-10-05',
    },
    {
      id: 'KA-BLR-1027',
      title: 'Bengaluru Transportation Hub',
      description: 'Land for transportation and logistics facilities.',
      price: '0',
      area: '5.5 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1',
      sellerName: 'Transport Solutions',
      listedDate: '2024-10-10',
    },
    {
      id: 'KA-BLR-1028',
      title: 'Bengaluru Residential Complex 2',
      description: 'Modern residential development with luxury amenities.',
      price: '0',
      area: '4.8 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2',
      sellerName: 'Luxury Homes 2',
      listedDate: '2024-10-15',
    },
    {
      id: 'KA-BLR-1029',
      title: 'Bengaluru Commercial District',
      description: 'Prime commercial land in central business district.',
      price: '0',
      area: '1.5 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3',
      sellerName: 'Commercial Realty 2',
      listedDate: '2024-10-20',
    },
    {
      id: 'KA-BLR-1030',
      title: 'Bengaluru Industrial Park',
      description: 'Large industrial park with all utilities and infrastructure.',
      price: '0',
      area: '9.7 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4',
      sellerName: 'Industrial Park Ltd',
      listedDate: '2024-10-25',
    },
    {
      id: 'KA-BLR-1031',
      title: 'Bengaluru Tech Innovation Center',
      description: 'Land for technology innovation and development center.',
      price: '0',
      area: '3.1 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5',
      sellerName: 'Tech Innovation',
      listedDate: '2024-10-30',
    },
    {
      id: 'KA-BLR-1032',
      title: 'Bengaluru Research Park',
      description: 'Land for research and development park.',
      price: '0',
      area: '4.6 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6',
      sellerName: 'Research Park',
      listedDate: '2024-11-05',
    },
    {
      id: 'KA-BLR-1033',
      title: 'Bengaluru Startup Village',
      description: 'Land for startup village and incubator facilities.',
      price: '0',
      area: '2.9 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7',
      sellerName: 'Startup Village',
      listedDate: '2024-11-10',
    },
    {
      id: 'KA-BLR-1034',
      title: 'Bengaluru Business Park',
      description: 'Land for business park and corporate offices.',
      price: '0',
      area: '5.3 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8',
      sellerName: 'Business Park',
      listedDate: '2024-11-15',
    },
    {
      id: 'KA-BLR-1035',
      title: 'Bengaluru Technology Hub',
      description: 'Land for technology hub and innovation center.',
      price: '0',
      area: '3.8 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9',
      sellerName: 'Technology Hub',
      listedDate: '2024-11-20',
    },
    {
      id: 'KA-BLR-1036',
      title: 'Bengaluru Innovation District',
      description: 'Land for innovation district and tech companies.',
      price: '0',
      area: '6.2 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0',
      sellerName: 'Innovation District',
      listedDate: '2024-11-25',
    },
    {
      id: 'KA-BLR-1037',
      title: 'Bengaluru Tech Corridor',
      description: 'Land in tech corridor with excellent connectivity.',
      price: '0',
      area: '4.1 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1',
      sellerName: 'Tech Corridor',
      listedDate: '2024-11-30',
    },
    {
      id: 'KA-BLR-1038',
      title: 'Bengaluru Digital Hub',
      description: 'Land for digital hub and technology companies.',
      price: '0',
      area: '2.6 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2',
      sellerName: 'Digital Hub',
      listedDate: '2024-12-05',
    },
    {
      id: 'KA-BLR-1039',
      title: 'Bengaluru Smart City',
      description: 'Land for smart city development and infrastructure.',
      price: '0',
      area: '7.9 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3',
      sellerName: 'Smart City Corp',
      listedDate: '2024-12-10',
    },
    {
      id: 'KA-BLR-1040',
      title: 'Bengaluru Green Tech Park',
      description: 'Land for green technology and sustainable development.',
      price: '0',
      area: '5.4 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4',
      sellerName: 'Green Tech Park',
      listedDate: '2024-12-15',
    },
    {
      id: 'KA-BLR-1041',
      title: 'Bengaluru AI Research Center',
      description: 'Land for AI research center and development facilities.',
      price: '0',
      area: '3.5 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5',
      sellerName: 'AI Research Center',
      listedDate: '2024-12-20',
    },
    {
      id: 'KA-BLR-1042',
      title: 'Bengaluru Fintech Hub',
      description: 'Land for fintech hub and financial technology companies.',
      price: '0',
      area: '2.8 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6',
      sellerName: 'Fintech Hub',
      listedDate: '2024-12-25',
    },
    {
      id: 'KA-BLR-1043',
      title: 'Bengaluru Edtech Campus',
      description: 'Land for edtech campus and educational technology companies.',
      price: '0',
      area: '4.9 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7',
      sellerName: 'Edtech Campus',
      listedDate: '2024-12-30',
    },
    {
      id: 'KA-BLR-1044',
      title: 'Bengaluru Healthtech Center',
      description: 'Land for healthtech center and healthcare technology companies.',
      price: '0',
      area: '3.2 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8',
      sellerName: 'Healthtech Center',
      listedDate: '2025-01-05',
    },
    {
      id: 'KA-BLR-1045',
      title: 'Bengaluru Agritech Farm',
      description: 'Land for agritech farm and agricultural technology development.',
      price: '0',
      area: '6.8 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
      sellerName: 'Agritech Farm',
      listedDate: '2025-01-10',
    },
    {
      id: 'KA-BLR-1046',
      title: 'Bengaluru Cleantech Park',
      description: 'Land for cleantech park and clean technology companies.',
      price: '0',
      area: '4.7 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0',
      sellerName: 'Cleantech Park',
      listedDate: '2025-01-15',
    },
    {
      id: 'KA-BLR-1047',
      title: 'Bengaluru Biotech Hub',
      description: 'Land for biotech hub and biotechnology companies.',
      price: '0',
      area: '5.6 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1',
      sellerName: 'Biotech Hub',
      listedDate: '2025-01-20',
    },
    {
      id: 'KA-BLR-1048',
      title: 'Bengaluru Nanotech Center',
      description: 'Land for nanotech center and nanotechnology development.',
      price: '0',
      area: '3.7 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2',
      sellerName: 'Nanotech Center',
      listedDate: '2025-01-25',
    },
    {
      id: 'KA-BLR-1049',
      title: 'Bengaluru Robotics Lab',
      description: 'Land for robotics lab and automation technology development.',
      price: '0',
      area: '2.3 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3',
      sellerName: 'Robotics Lab',
      listedDate: '2025-01-30',
    },
    {
      id: 'KA-BLR-1050',
      title: 'Bengaluru Future Tech Park',
      description: 'Land for future technology park and next-gen companies.',
      price: '0',
      area: '8.1 acres',
      location: 'Bengaluru, Karnataka',
      seller: '0x4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4',
      sellerName: 'Future Tech Park',
      listedDate: '2025-02-05',
    }
  ])


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="glass holo-border group hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-blue-50 group-hover:text-blue-100 transition-colors">
                  {listing.title}
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-200 border-blue-400/30">
                  {listing.price} LT
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">{listing.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  <span className="text-muted-foreground">
                    {isLandPurchased(listing.id) 
                      ? (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'You')
                      : listing.sellerName
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Listed: {listing.listedDate}</span>
                </div>
              </div>

              {isLandPurchased(listing.id) ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Already Purchased</span>
                  </div>
                  <Button 
                    onClick={() => {
                      const portfolioButton = document.querySelector('[data-value="portfolio"]')
                      if (portfolioButton) {
                        (portfolioButton as HTMLElement).click()
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    View in Portfolio
                  </Button>
                </div>
              ) : (
                <PaymentModal
                  landId={listing.id}
                  landTitle={listing.title}
                  price={listing.price}
                  sellerAddress={listing.seller}
                  onPurchaseSuccess={() => {
                    // Add to purchased lands immediately
                    addPurchasedLand({
                      id: listing.id,
                      title: listing.title,
                      description: listing.description,
                      price: listing.price,
                      area: listing.area,
                      location: listing.location,
                      seller: listing.seller,
                      sellerName: listing.sellerName,
                      purchaseDate: new Date().toISOString().split('T')[0]
                    })
                    
                    // Show success toast
                    toast.success(`Successfully purchased ${listing.title}!`)
                    toast.success('Land added to your portfolio')
                    
                    // Redirect to portfolio tab after DhartiPay animation
                    setTimeout(() => {
                      const portfolioButton = document.querySelector('[data-value="portfolio"]')
                      if (portfolioButton) {
                        (portfolioButton as HTMLElement).click()
                      }
                    }, 100) // Small delay to ensure state is updated
                  }}
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Purchase Land
                  </Button>
                </PaymentModal>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <Card className="glass holo-border">
          <CardContent className="py-12 text-center">
            <div className="space-y-2">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Land Listings Available</h3>
              <p className="text-muted-foreground">
                Check back later for new land properties
              </p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
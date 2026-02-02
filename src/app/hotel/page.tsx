'use client'
import MineTable from "@/components/hotel/MineTable";
import HotelModal from "@/components/hotel/HotelModal";
import { Button } from "@arco-design/web-react";

export default function Home() {
    return (
      <div
        style={{
          background: "#272727",
          width: "100%",
          height: "100%",
        }}
      >
        <div style={{padding:'10px 10px 0 10px'}}>
          <HotelModal />
        </div>
        <div style={{padding:'10px'}}>
          <MineTable />
        </div>
        
      </div>
    );
  }
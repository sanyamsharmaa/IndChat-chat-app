import React from 'react'
import instance from '../utils/Instance';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();

  const [mail, setmail] = useState("ww@gmail.com")
  
  const handleLogin = async(e)=>{
     e.preventDefault();
    try{
      
      const res = await instance.post('/login',{mail : mail})
      // const res = await instance.post('/login',{mail : mail})
      // setmail(mail)
      console.log(res.data)
      if(res?.data?.success){
        console.log("navigating")
        navigate('/chats');
        return
      }
      // alert(res?.data?.msg)
    }
    catch(err){
      alert(`login failed - ${err}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-lg border border-blue-200 bg-blue-50">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-2">IndChat</h1>
        <h2 className="text-lg text-blue-600 text-center mb-6">Login</h2>


        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={mail}
            className="p-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e)=>{setmail(e.target.value)}}
          />


          <button
            type="submit"
            className="p-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

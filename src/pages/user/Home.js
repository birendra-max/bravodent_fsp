import React, { use, useContext } from "react";
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from "../../Context/UserContext";
export default function Home() {
    const { user } = useContext(UserContext);
    return (
        <>
            <Hd />
            <section className="mt-44">
                <h1>Hello i am User Dashboard</h1>
                <p>
                    {
                        console.log(user.pic)
                    }
                </p>
            </section>
            <Foot />
        </>
    )
}
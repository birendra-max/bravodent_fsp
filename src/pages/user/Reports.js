import React, { useContext , useEffect} from "react";
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from 'react-router-dom';

export default function Reports() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const resp = await fetch('http://localhost/bravodent_ci/session-check', {
                    method: "GET",
                    credentials: "include",
                });

                const data = await resp.json();

                if (data.status !== "success") {
                    navigate("/", { replace: true });
                }
            } catch (error) {
                console.error("Error checking session:", error);
                navigate("/", { replace: true });
            }
        };

        checkSession();
    }, []);

    const { user } = useContext(UserContext);
    return (
        <>
            <Hd />
            <section className="mt-44">
                <h1>Hello i am User Reports</h1>
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
import { useParams } from "react-router-dom";

export default function OrderDetails() {
    const {id} = useParams();
    return (
        <>
            <h1>Hello i am order details</h1>
            {id}
        </>
    )
}
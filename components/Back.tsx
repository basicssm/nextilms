import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function Back() {
  const router = useRouter();

  return (
    <>
      <div onClick={() => router.back()}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Volver</span>
      </div>
      <style jsx>
        {`
          div {
            cursor: pointer;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 70px;
            padding-right: 20px;
          }

          span {
            line-heigth: 16px;
          }
        `}
      </style>
    </>
  );
}

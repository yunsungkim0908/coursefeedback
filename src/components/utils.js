import Swal from "sweetalert2";

export const truncateString = (text, length) => {
  if (text.length <= length)
    return text
  return text.slice(0, length-4) + "..."
}

export const ErrorMessage = (errorMsg) => {
  console.log(errorMsg)
  Swal.fire({
    icon: "error",
    title: errorMsg
  })
}

export const SuccessMessage = (successMsg) => {
  Swal.fire({
    icon: "success",
    title: successMsg,
  })
}

export const SectionCard = (props) => {
  return(
    <div className="card mt-4 mx-auto" style={{maxWidth: 800}}>
      <div className="card-body small-padding-card">
        <div className="question-spacing">
          <div className="question-spacing">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  )
}

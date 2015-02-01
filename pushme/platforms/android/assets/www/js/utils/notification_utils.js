/**
 * 処理が成功した場合の通知を上部からスライドインさせる
 * @param {funcType} 
 */
function notifySuccess(funcType){
	switch (funcType) {
		case "add":
			showNotification({
				message: "Add process is succeded.",
				autoClose: true,
				duration: 2,
				type: "success"
			});
			break;
		case  "edit":
			showNotification({
				message: "Edit process is succeded.",
				autoClose: true,
				duration: 2,
				type: "success"
			});	
			break;
		case  "delete":
			showNotification({
				message: "Delete process is succeded.",
				autoClose: true,
				duration: 2,
				type: "success"
			});	
			break;	
	}
}

/**
 * 処理が失敗した場合の通知を上部からスライドインさせる
 * @param {funcType} 
 */
function notifyFailure(funcType){
	switch (funcType) {
		case "add":
			showNotification({
				message: "Add process is failed.",
				autoClose: true,
				duration: 2,
				type: "error"
			});
			break;
		case  "edit":
			showNotification({
				message: "Edit process is failed.",
				autoClose: true,
				duration: 2,
				type: "error"
			});	
			break;
		case  "delete":
			showNotification({
				message: "Delete process is failed.",
				autoClose: true,
				duration: 2,
				type: "error"
			});	
			break;	
	}
}
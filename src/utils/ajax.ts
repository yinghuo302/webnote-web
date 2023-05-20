export namespace ajax {
	function createXHR(): XMLHttpRequest{
		if (window.XMLHttpRequest) 
			return new XMLHttpRequest();
		else 
			return new ActiveXObject("Microsoft.XMLHTTP");
	}

	export function ajax(params: {
		type: string,            
		url: string,   
		data?: any,    
		dataType?: string,
		responseType?:string,      
		isAsync?: boolean        
	}): Promise<any> {

		let type = params.type.toUpperCase();
		let url = params.url;
		let data = params.data ? params.data : {};
		let dataType = params.dataType ? params.dataType : "json";
		let responseType = params.responseType? params.responseType: "json"
		let isAsync = params.isAsync ? params.isAsync : true;
		
		let xhr = createXHR();
		

		return new Promise((resolve, reject) => {
			if(dataType=='queryStr'){
				let qureyStr = "";
				Object.keys(data).forEach(key => qureyStr += `${key}=${data[key]}&`);
				qureyStr = qureyStr.slice(0, -1);	
				url += `?${qureyStr}`;
			}
			xhr.open(type, url, isAsync);
			if(dataType=='json'){
				xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
				xhr.send(JSON.stringify(data));
			}
			else{
				// xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				data = (dataType=='queryStr')? undefined: data
				xhr.send(data)
			}
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status <= 300 || xhr.status == 304) {
						let res = responseType == "json"? JSON.parse(xhr.responseText) : xhr.responseText;
						resolve(res);
					} else {
						reject(xhr.readyState);
					}
				}
			}
		})
	}
}
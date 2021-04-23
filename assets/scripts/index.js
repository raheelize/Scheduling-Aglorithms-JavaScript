var chart = document.getElementById('chart').getContext('2d');

const app=new Vue({
	el: '#app',
	data: {
		data:[],
		type:"",
		labels:[],
		error:null,
		processes:[],
		chartData:[],
		warning:null,
		burstTime:null,
		arrivalTime:null,
		timeQuantum:null,
		completionTime:null,
		turnAroundTime:null,
		timeQuantumInput:5,
		chartBorderColors:[],
		chartBackGroundColors:[],
		listBorderColor:[
			'rgba(255, 99, 132, 1)',
			'rgba(54, 162, 235, 1)',
			'rgba(255, 206, 86, 1)',
			'rgba(75, 192, 192, 1)',
			'rgba(153, 102, 255, 1)',
			'rgba(255, 159, 64, 1)'],
		listBackgroundColor:[
			'rgba(255, 99, 132, 0.2)',
			'rgba(54, 162, 235, 0.2)',
			'rgba(255, 206, 86, 0.2)',
			'rgba(75, 192, 192, 0.2)',
			'rgba(153, 102, 255, 0.2)',
			'rgba(255, 159, 64, 0.2)']
	},
	methods:{
		
		isnertProccess(){
			this.processes.push({arrive:"", birth:""})
			this.error=null;
		},
		create_process(){
			//document.getElementById("check").innerHTML  = "CHECKED!";
			var text = document.getElementById("num").value;
			var number = parseInt(text, 10);
			for (let index = 0; index < number; index++) {
				this.processes.push({arrive:"", birth:""})
				this.error=null;
				
			}
			document.getElementById("label").innerHTML  = "Add More";
			document.getElementById("num").value = "0";
		},
		deleteProccess(index){
  			this.processes.splice(index, 1);
		},
		simulate(){
			if (this.processes.length==0) {
				this.error="insert at least 1 process.";
				return;
			}
			this.data=[];
			for (var i = 0; i < this.processes.length; i++) {
				if (this.processes[i].arrive=="" || this.processes[i].birth=="") {
					this.error="Fill all field for all processes.";
					return;
				}
				this.data.push({arrive:parseInt(this.processes[i].arrive), birth:parseInt(this.processes[i].birth), index:i});
			}
			this.error=null;
			this.warning=[];
			switch(this.type){
				case "fcfs":
					app.simulateFCFS();
				break;
				case "sjf":
					app.simulateSJF();
				break;
				case "round-robin":
					if (this.timeQuantumInput.length==0){
						this.warning.push("Time Quantum set to 1");
						this.timeQuantum=1;
					}else{
						this.timeQuantum=parseFloat(this.timeQuantumInput);
					}
					app.simulateROUNDROBIN();
				break;
				default:
					this.error="select simulate type.";
					return;
			}
			app.calculateDetails();
		},
		simulateFCFS(){
			app.sortByArriveTime();
			var proccessedData=[
				{
					index:this.data[0].index,
					arrive: this.data[0].arrive,
					start:this.data[0].arrive,
					birth:this.data[0].birth,
					finish:(this.data[0].arrive+this.data[0].birth)
				}
			];
			this.labels=[];
			this.labels.push("process"+(this.data[0].index+1));
			this.borderColor=[];
			this.backgroundColor=[];
			this.borderColor[0]=[this.listBorderColor[0]];
			this.backgroundColor[0]=[this.listBackgroundColor[0]];
			for (var i = 1; i < this.data.length; i++) {
				this.labels.push("process "+(this.data[i].index+1));
				this.borderColor.push(this.listBorderColor[i%6]);
				this.backgroundColor.push(this.listBackgroundColor[i%6]);
				var singleProccess={};
				singleProccess.index=this.data[i].index;
				singleProccess.arrive=this.data[i].arrive;
				singleProccess.birth=this.data[i].birth;
				if (this.data[i].arrive<proccessedData[i-1].finish)
					singleProccess.start=proccessedData[i-1].finish;
				else
					singleProccess.start=this.data[i].arrive;
				singleProccess.finish=(singleProccess.start+singleProccess.birth);
				proccessedData.push(singleProccess);
			}
			this.chartData=[];
			for (var i = 0; i < proccessedData.length; i++) {
				this.chartData.push([proccessedData[i].start,proccessedData[i].finish]);
			}
			app.showChart();
		},
		simulateSJF(){
			app.sortByArriveTime();
			var pr;
			var queue=[];
			var singleProccess={};
			var proccessedData=[
				{
					index:this.data[0].index,
					arrive: this.data[0].arrive,
					start:this.data[0].arrive,
					birth:this.data[0].birth,
					finish:(this.data[0].arrive+this.data[0].birth)
				}
			];
			while(proccessedData.length<this.data.length){
				singleProccess={};
				queue=app.fillQueue(queue, proccessedData[proccessedData.length-1].start, proccessedData[proccessedData.length-1].finish, proccessedData[proccessedData.length-1].index);
				pr=app.findMinInQueue(queue);
				if (pr==null)
					pr=app.findMinInQueueFree(this.data, proccessedData[proccessedData.length-1].finish);
				queue.splice(queue.indexOf(pr), 1);
				singleProccess.index=pr.index;
				singleProccess.arrive=pr.arrive;
				singleProccess.birth=pr.birth;
				if (pr.arrive>proccessedData[proccessedData.length-1].finish)
					singleProccess.start=singleProccess.arrive;
				else
					singleProccess.start=proccessedData[proccessedData.length-1].finish;
				singleProccess.finish=(singleProccess.start+singleProccess.birth);
				proccessedData.push(singleProccess);
			}
			this.labels=[];
			this.chartData=[];
			this.borderColor=[];
			this.backgroundColor=[];
			for (var i = 0; i < proccessedData.length; i++) {
				this.borderColor.push(this.listBorderColor[i%6]);
				this.backgroundColor.push(this.listBackgroundColor[i%6]);
				this.labels.push("process "+(proccessedData[i].index+1));
				this.chartData.push([proccessedData[i].start, proccessedData[i].finish]);
			}
			app.showChart();
		},
		simulateROUNDROBIN(){
			app.sortByArriveTime;
			var pickedProccess;
			queue=[
				{
					index:this.data[0].index,
					birth:this.data[0].birth,
					arrive: this.data[0].arrive,
					executes:[],
					birthLeft:this.data[0].birth
				}
			];
			var time=this.data[0].arrive;
			var response=[];
			while(true){
				if (queue.length==0){
					queue=app.isnertProccessToQueueInFreeTime(queue, time);
					if (queue.length==0){
						this.chartData=response;
						console.log(response);
						this.warning.push("");
						return
					}else
						time=queue[queue.length-1].arrive;
				}
				pickedProccess=queue[0];
				queue.splice(0, 1);
				queue=app.insertProccessToQueueWhileExecute(queue, time, time+this.timeQuantum, pickedProccess.index);
				pickedProccess.executes.push({
					start:time,
					finish:time+this.timeQuantum
				});
				pickedProccess.birthLeft=pickedProccess.birthLeft-this.timeQuantum;
				time+=this.timeQuantum;
				if (pickedProccess.birthLeft>0){
					queue.push(pickedProccess);
				}else{
					if (pickedProccess.birthLeft<0){
						pickedProccess.executes[pickedProccess.executes.length-1].finish=pickedProccess.executes[pickedProccess.executes.length-1].finish+pickedProccess.birthLeft;						
						time+=pickedProccess.birthLeft;
						pickedProccess.birthLeft=0;
					}
					response.push(pickedProccess);
				}
			}
		},
		showChart(){
			var myChart = new Chart(chart, {
			    type: 'horizontalBar',
			    data: {
			        labels: this.labels,
			        datasets: [{
			        	label: 'processes',
			            data: this.chartData,
			            borderColor: this.borderColor,
			            backgroundColor:this.backgroundColor,
			            borderWidth: 1	
			        }]
			    },
			    options: {
			        scales: {
			            xAxes: [{
			                ticks: {
			                    beginAtZero: true
			                }
			            }]
			        },
					legend: {
						display: false
                    }
			    }
			});
		},
		sortByArriveTime(){
			this.data.sort(function compare( a, b ) {
			  if ( a.arrive < b.arrive ){
			    return -1;
			  }
			  if ( a.arrive > b.arrive ){
			    return 1;
			  }
			  // arrive time are same so we check birth time
			  if (a.birth<b.birth){
			  	return -1;
			  }
			  if (a.birth>b.birth){
			  	return 1;
			  }
			  // arrive time and birth time are same
			  return 0;
			});
		},
		fillQueue(queue, start, finish, index){
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].arrive>=start && this.data[i].arrive<=finish && this.data[i].index!=index) {
					queue.push(this.data[i]);
				}
			}
			return queue;
		},
		findMinInQueueFree(data, greaterFrom){
			data.sort(function compare( a, b ) {
			  if ( a.arrive < b.arrive ){
			    return -1;
			  }
			  if ( a.arrive > b.arrive ){
			    return 1;
			  }
			  return 0;
			});
			for (var i = 0; i < data.length; i++) {
				if (data[i].arrive>greaterFrom){
					return data[i];
				}
			}
		},
		findMinInQueue(queue){
			queue.sort(function compare( a, b ) {
			  if ( a.birth < b.birth ){
			    return -1;
			  }
			  if ( a.birth > b.birth ){
			    return 1;
			  }
			  return 0;
			});
			return queue[0];
		},
		insertProccessToQueueWhileExecute(queue, start, finish, index){
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].arrive>=start && this.data[i].arrive<finish && this.data[i].index!=index) {
					queue.push(
						{
							executes:[],
							index:this.data[i].index,
							birth:this.data[i].birth,
							arrive:this.data[i].arrive,
							birthLeft:this.data[i].birth
						}
					);
				}
			}
			return queue;
		},
		isnertProccessToQueueInFreeTime(queue, greaterFrom){
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].arrive>greaterFrom){
					queue.push(
						{
							executes:[],
							index:this.data[i].index,
							birth:this.data[i].birth,
							arrive:this.data[i].arrive,
							birthLeft:this.data[i].birth
						}
					);
					return queue;
				}
			}
			return [];
		},
		calculateDetails(){
			this.burstTime=app.totalBitrh()/this.processes.length;
			this.arrivalTime=app.totalArrive()/this.processes.length;
			this.completionTime=app.totalFinish()/this.processes.length;
			this.turnAroundTime=app.completionTime-app.arrivalTime;
		},
		totalFinish(){
			// types are fcfs , sjf, round-robin
			if (this.type == "round-robin")
				return app.totalFinishTimesRoundRobin();
			else
				return app.totalFinishTimes(); 
		},
		totalFinishTimes(){
			var res=0;
			for (var i = 0; i < this.chartData.length; i++)
				res+=this.chartData[i][1];
			return res;
		},
		totalFinishTimesRoundRobin(){
			var res=0;
			for (var i = 0; i < this.chartData.length; i++)
				res+=this.chartData[i].executes[this.chartData[i].executes.length-1].finish;
			return res;
		},
		totalArrive(){
			var res=0;
			for (var i = 0; i < this.data.length; i++)
				res+=this.data[i].arrive;
			return res;
		},
		totalBitrh(){
			var res=0;
			for (var i = 0; i < this.data.length; i++)
				res+=this.data[i].birth;
			return res;	
		}
	}
});

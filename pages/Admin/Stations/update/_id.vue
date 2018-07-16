<template>
	<div id="form" class="box">
		<div class="is-pulled-left">
			<b-field label='Station Name*' style="width: 410px">
				<b-input placeholder='Enter Station Name' v-model="name" required></b-input>
			</b-field>

			<b-field grouped>
				<b-field label="Select Start Time">
					<b-timepicker v-model="startTime"
						:min-time='minTime'
						:max-time='maxTime'
						:increment-minutes=10>
					</b-timepicker>
				</b-field>

				<b-field label="Select End Time">
					<b-timepicker v-model="endTime"
						:min-time='minTime'
						:max-time='maxTime'
						:increment-minutes=10>
					</b-timepicker>
				</b-field>
			</b-field>

			<b-field label="Description" width="410px">
				<b-input maxlength="500" type="textarea" v-model="description"></b-input>
			</b-field>

			<b-field label='Image' style="margin-top: -10px">
				<b-field class='file'>
					<b-upload v-model='files' accept="image/*">
						<a class='button is-primary'>
							<b-icon icon='upload'></b-icon>
							<span>Upload Image</span>
						</a>
					</b-upload>
					<span class='file-name' v-if='files && files.length'>
					{{ files[0].name }}
					</span>
				</b-field>
			</b-field>

			<br/>
			<button class="button is-success" :disabled="isDisabled" @click="submit()">Update Station</button>
			&nbsp;&nbsp;
			<button class="button is-danger" @click='remove()'>Remove Station</button>
		</div>

		<div class="is-pulled-right" id="img">
			<b-field label="Image">
				<b-upload v-model="files" drag-drop>
					<section class="section">
						<div class="content has-text-centered">
							<p><b-icon icon="upload" size="is-large"></b-icon></p>
							<p>Drop your files here or click to upload</p>
						</div>
					</section>
				</b-upload>
			</b-field>
		</div>
	</div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

function WebFormData(name, description, noOfRSlots, startTime, endTime, file) {
	this.name = name,
	this.description = description,
	this.noOfRSlots = noOfRSlots,
	this.startTime = startTime,
	this.endTime = endTime,
	this.file = file
}

export default {
	data() {
		const min = new Date()
		min.setHours(10)
		min.setMinutes(0)
		const max = new Date()
		max.setHours(18)
		max.setMinutes(0)
		return {
			name: '',
			description: '',
			minTime: min,
			maxTime: max,
			startTime: min,
			endTime: max,
			files: []
		}
	},
	beforeCreate() {
		axios.get('http://localhost:8000/stations/' + this.$route.params['id'])
    .then((res) => {
			let data = res.data[0]
			this.name = data.station_name
			this.description = data.description
			let start = new Date()
			start.setHours(data.station_start.slice(0,2))
			start.setMinutes(data.station_start.slice(3,5))
			this.startTime = start
			
			let end = new Date()
			end.setHours(data.station_end.slice(0,2))
			end.setMinutes(data.station_end.slice(3,5))
			this.endTime = end
    })
    .catch(() => {
      console.log('FAIL')
    })
	},
	methods: {
		submit() {
			let webFormData = new WebFormData(this.name, this.description, 2, 
			moment(this.startTime, 'HH:mm').format('HH:mm'), moment(this.endTime, 'HH:mm').format('HH:mm'), 
			this.files[0])
			
			let formData = new FormData()
			//console.log(formData)
			formData.append(webFormData.name, webFormData.file)
			formData.append('webFormData', JSON.stringify(webFormData))
			console.log(webFormData)
			axios.put('http://localhost:8000/stations/' + this.$route.params['id'],
				formData
			).then((res) => {
				// console.log(res.data)
				if (res.data.toLowerCase() === 'success') {
					this.$dialog.alert({
						title: 'Update Station',
						message: 'The Station: ' + this.name + ' has been updated successfully',
						type: 'is-success',
						hasIcon: true,
						icon: 'check-circle',
						iconPack: 'mdi'
					})
				}
			})
			.catch(() => {
				console.log('FAILURE')
			})
		},
		remove() {
			axios.delete('http://localhost:8000/stations/' + this.$route.params['id'])
			.then(res => {
				if (res.data.toLowerCase() === 'success') {
					this.$dialog.alert({
						title: 'Remove Station',
						message: 'The Station: ' + this.name + ' has been removed successfully',
						type: 'is-success',
						hasIcon: true,
						icon: 'check-circle',
						iconPack: 'mdi'
					})
					this.$route.push('/Admin/Stations')
				}
			})
			.catch(() => {
				console.log('FAILURE')
			})
		}
	},
	computed: {
		isDisabled() {
      return !this.name || !this.description || !this.files[0]
    }
	}
}
</script>

<style>
#form {
  float: left;
	margin: 25px 60px 25px 70px;
}
#img {
	margin-left: 35px;
}
</style>
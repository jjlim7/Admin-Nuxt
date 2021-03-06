<template>
	<section id="content" class="box columns is-multiline">
		<div class="column is-7">
			<b-field label="Select Date">
				<b-datepicker
					placeholder="Click to select..."
					icon="calendar-today"
					:min-date="minDate"
					v-model="date"
					rounded>
				</b-datepicker>
			</b-field>

			<b-field label='Select Station' :type="errors.has('station') ? 'is-danger': ''"
				:message="errors.has('station') ? errors.first('station') : ''">
				<b-select expanded placeholder='Select Station' v-model="stationId" @input="displayRole=true"
					name="station" v-validate="'required'" data-vv-as="'Station'" rounded>
					<option v-for="station in stationList" :value="station.station_id" :key="station.station_name">
						{{station.station_name}}
					</option>
				</b-select>
			</b-field>

			<b-field label='Select Role' :type="errors.has('role') ? 'is-danger': ''"
				:message="errors.has('role') ? errors.first('role') : ''">
				<b-select expanded placeholder='Select Role' v-model="roleId"
					name="role" v-validate="'required'" data-vv-as="'Role'" rounded>
					<option disabled>Please select a station first</option>
					<option v-for="role in filterRoles" :value="role.role_id" :key="role.role_name">
						{{ role.role_name }}
					</option>
				</b-select>
			</b-field>

			<b-field grouped>
				<b-field label='Set Limit'>
					<b-select v-model='limit' placeholder='Select Limit' required rounded>
						<option v-for="i in 11" :key="i">{{ i-1 }}</option>
					</b-select>
				</b-field>
			</b-field>

			<br/>
			<button class="button is-success is-pulled-right" :disabled="isDisabled"
			@click="validateBeforeSubmit()">Submit</button>
			<router-link to="/Admin/Limit/"
			class="button is-light is-pulled-right right-spaced">Cancel</router-link>
		</div>
	</section>
</template>

<script>

import DataModel from '~/models/dataModel.js'
import moment from 'moment'
import config from '~/config.js'

export default {
	data() {
		const today = new Date()
		return {
			roleList: [],
			roleId: null,
			limit: null,
			stationId: null,
			stationList: null,
			minDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
			date: new Date()
		}
	},
	async mounted() {
		this.$store.commit('setPageTitle', 'Set Limit')

		let res = await this.$axios.get(`http://${config.serverURL}/roles/`)
		this.roleList = res.data[0]
		this.stationList = res.data[1]
	},
	methods: {
		submit() {
			let date = moment(this.date).format('YYYY-MM-DD')
			let roleName = this.roleList.find(i => i.role_id === this.roleId).role_name
			let webFormData = new DataModel.Limit(this.stationId, this.roleId,
				date, this.limit)

			this.$axios.post(`http://${config.serverURL}/limit/`, webFormData)
			.then(res => {
				if (res.status === 200) {
					this.$dialog.alert({
						title: 'Set Limit',
						message: `A new limit has been set for <b>${roleName}</b> on <b>${date}</b>`,
						type: 'is-success',
						hasIcon: true,
						icon: 'check-circle',
						iconPack: 'mdi',
						onConfirm: () => this.$router.push('/Admin/Limit')
					})
				}
			})
			.catch(err => {
				this.$dialog.alert({
					title: 'Error',
					message: `A limit has already been set for <b>${roleName}</b> on <b>${date}</b>`,
					type: 'is-danger',
					hasIcon: true
				})
			})
		},
		validateBeforeSubmit() {
			this.$validator.validateAll().then(res => {
				if (res) {
					this.submit()
				}
			})
		}
	},
	computed: {
		isDisabled() {
			return !this.limit || !this.date || !this.roleId || !this.stationId
		},
		filterRoles() {
			if (this.stationId) {
				return this.roleList.filter(i => i.station_id === this.stationId)
			}
		}
	}
}
</script>

<style scoped>
.right-spaced {
  margin-right: 1.5vw;
}
</style>

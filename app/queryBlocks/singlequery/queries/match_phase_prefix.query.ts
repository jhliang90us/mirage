import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from "@angular/core";

@Component({
	selector: 'match-phase-prefix-query',
	template: 	`<span class="col-xs-6 pd-10">
					<div class="form-group form-element query-primary-input">
						<span class="input_with_option">
							<input type="text" class="form-control col-xs-12"
								[(ngModel)]="inputs.input.value"
							 	placeholder="{{inputs.input.placeholder}}"
							 	(keyup)="getFormat();" />
						</span>
					</div>
					<button (click)="addOption();" class="btn btn-info btn-xs add-option"> <i class="fa fa-plus"></i> </button>
				</span>
				<div class="col-xs-12 option-container" *ngIf="optionRows.length">
					<div class="col-xs-12 single-option" *ngFor="let singleOption of optionRows, let i=index">
						<div class="col-xs-6 pd-l0">
							<editable
								class = "additional-option-select-{{i}}"
								[editableField]="singleOption.name"
								[editPlaceholder]="'--choose option--'"
								[editableInput]="'select2'"
								[selectOption]="options"
								[passWithCallback]="i"
								[selector]="'additional-option-select'"
								[querySelector]="querySelector"
								[informationList]="informationList"
								[showInfoFlag]="true"
								[searchOff]="true"
								(callback)="selectOption($event)">
							</editable>
						</div>
						<div class="col-xs-6 pd-0">
							<div class="form-group form-element">
								<input class="form-control col-xs-12 pd-0" type="text" [(ngModel)]="singleOption.value" placeholder="value"  (keyup)="getFormat();"/>
							</div>
						</div>
						<button (click)="removeOption(i)" class="btn btn-grey delete-option btn-xs">
							<i class="fa fa-times"></i>
						</button>
					</div>
				</div>
				`,
	inputs: [ 'getQueryFormat', 'querySelector']
})

export class Match_phase_prefixQuery implements OnInit, OnChanges {
	@Input() queryList;
	@Input() selectedField;
	@Input() appliedQuery;
	@Input() selectedQuery;
	@Output() getQueryFormat = new EventEmitter<any>();
	public queryName = '*';
	public fieldName = '*';
	public current_query: string = 'match_phrase_prefix';
	public information: any = {
		title: 'Match Phrase with a Prefix',
		content: `<span class="description">Returns matches similar to Match Phrase except the last term of the query text can be a prefix.</span>
					<a class="link" href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html#query-dsl-match-query-phrase-prefix">Read more</a>`
	};
	public informationList: any = {
		'analyzer': {
			title: 'analyzer',
			content: `<span class="description"><strong>analyzer</strong> can be set to control for the analysis process on the query text.</span>`
		},
		'max_expansions': {
			title: 'max_expansions',
			content: `<span class="description">The maximum number of terms that the query will expand to. Defaults to 50.</span>`
		}
	};
	public default_options: any = [
		'analyzer',
		'max_expansions'
	];
	public options: any
	public singleOption = {
		name: '',
		value: ''
	};
	public optionRows: any = [];

	public inputs: any = {
		input: {
			placeholder: 'Prefix',
			value: ''
		}
	};
	public queryFormat: any = {};

	ngOnInit() {
		this.options = JSON.parse(JSON.stringify(this.default_options));
		try {
			if(this.appliedQuery['match_phrase_prefix'][this.fieldName]) {
				if (this.appliedQuery[this.current_query][this.fieldName]) {
					this.inputs.input.value = this.appliedQuery[this.current_query][this.fieldName].query;
					for (let option in this.appliedQuery[this.current_query][this.fieldName]) {
						if (option != 'query') {
							var obj = {
								name: option,
								value: this.appliedQuery[this.current_query][this.fieldName][option]
							};
							this.optionRows.push(obj);
						}
					}
				} else {
					this.inputs.input.value = this.appliedQuery[this.current_query][this.fieldName];
				}
			}
		} catch(e) {}
		this.getFormat();
		this.filterOptions();
	}

	ngOnChanges() {
		if(this.selectedField != '') {
			if(this.selectedField !== this.fieldName) {
				this.fieldName = this.selectedField;
				this.getFormat();
			}
		}
		if(this.selectedQuery != '') {
			if(this.selectedQuery !== this.queryName) {
				this.queryName = this.selectedQuery;
				this.getFormat();
				this.optionRows = [];
			}
		}
	}

	// QUERY FORMAT
	/*
		Query Format for this query is
		@queryName: {
			@fieldName: @value
		}
	*/
	getFormat() {
		if (this.queryName === 'match_phrase_prefix') {
			this.queryFormat = this.setFormat();
			this.getQueryFormat.emit(this.queryFormat);
		}
	}
	setFormat() {
		var queryFormat = {};
		queryFormat[this.queryName] = {};
		if (this.optionRows.length) {
			queryFormat[this.queryName][this.fieldName] = {
				query: this.inputs.input.value
			};
			this.optionRows.forEach(function(singleRow: any) {
				queryFormat[this.queryName][this.fieldName][singleRow.name] = singleRow.value;
			}.bind(this))
		} else {
			queryFormat[this.queryName][this.fieldName] = this.inputs.input.value;
		}
		return queryFormat;
	}
	selectOption(input: any) {
		input.selector.parents('.editable-pack').removeClass('on');
		this.optionRows[input.external].name = input.val;
		this.filterOptions();
		setTimeout(function() {
			this.getFormat();
		}.bind(this), 300);
	}
	filterOptions() {
		this.options = this.default_options.filter(function(opt) {
			var flag = true;
			this.optionRows.forEach(function(row) {
				if(row.name === opt) {
					flag = false;
				}
			});
			return flag;
		}.bind(this));
	}
	addOption() {
		var singleOption = JSON.parse(JSON.stringify(this.singleOption));
		this.filterOptions();
		this.optionRows.push(singleOption);
	}
	removeOption(index: Number) {
		this.optionRows.splice(index, 1);
		this.filterOptions();
		this.getFormat();
	}
}

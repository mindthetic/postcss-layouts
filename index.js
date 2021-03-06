import postcss from "postcss";

function layoutProp(decl, webComponents) {


	const childSelector = " > *";
	const slottedSelector = " > ::slotted(*)";
	const originalRule = decl.parent;
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});
	const levelTwoSlotted = postcss.rule({selector: originalRule.selector + slottedSelector});
	const values = postcss.list.space(decl.value);

	// Check first value for layout method
	let flex = values[0] === "flex";
	let inlineBlock = values[0] === "inline-block";

	// If flex
	if (flex) {

		// Add new rules
		originalRule.before(levelTwoRule);
		if (webComponents) {
			originalRule.before(levelTwoSlotted);
		}

		decl.before(
			`display: flex;`
		);


		// Parameters
		let column 	= false;
		let wrap 	= true;
		let open 	= false;
		let grow 	= true;

		for (let _i = 0; _i < values.length; _i++) {
			switch (values[_i]) {
				case "column":
					column = true;
					break;
				case "nowrap" || "no-wrap":
					wrap = false;
					break;
				case "open":
					open = true;
					break;
				case "shrink":
					grow = false;
					break;
				default:
					grow = true;
			}
		}
		if (column) {
			decl.before(
				`flex-direction: column;`
			);
		}
		if (wrap) {
			decl.before(
				`flex-wrap: wrap;`
			);
		}
		if (wrap && !open) {
			levelTwoRule.append(
				`flex-basis: 0;`
			);
			if (webComponents) {
				levelTwoSlotted.append(
					`flex-basis: 0;`
				);
			}
		}
		if (grow) {
			levelTwoRule.append(
				`flex-grow: 1;`
			);
			if (webComponents) {
				levelTwoSlotted.append(
					`flex-grow: 1;`
				);
			}
		}
		if (open) {
			levelTwoRule.append(
				`flex-basis: 100%;`
			);
			if (webComponents) {
				levelTwoSlotted.append(
					`flex-basis: 100%;`
				);
			}
		}

	}

	// If inline-block
	if (inlineBlock) {

		// Add new rule
		originalRule.before(levelTwoRule);

		originalRule.append(
			`font-size: 0.1%;`
		);

		levelTwoRule.append(`
			display: inline-block;
			width: 100%;
			font-size: 100000%`
		);

	}

	// Tidy indents
	originalRule.walk(i => { delete i.raws.before });
	levelTwoRule.walk(i => { delete i.raws.before });
	levelTwoSlotted.walk(i => { delete i.raws.before });

	decl.remove();
}

// plugin
export default postcss.plugin("postcss-postcss-layouts", opts => {
	var webComponents = false;
	if (opts && opts.webComponents) {
		webComponents = true;
	}
	return (root) => {
		root.walkDecls(function(decl) {
			if (decl.prop === "layout") {
				layoutProp(decl, webComponents);
			}
		});
	};
});

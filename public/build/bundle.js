
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Menu.svelte generated by Svelte v3.42.2 */

    const file$1 = "src/Menu.svelte";

    function create_fragment$1(ctx) {
    	let nav;
    	let button0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let t3;
    	let button2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let t5;
    	let button3;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			button0 = element("button");
    			img0 = element("img");
    			t0 = text("\n\t\t\tMinecraft");
    			t1 = space();
    			button1 = element("button");
    			img1 = element("img");
    			t2 = text("\n\t\t\tTerraria");
    			t3 = space();
    			button2 = element("button");
    			img2 = element("img");
    			t4 = text("\n\t\t\tArma 3");
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "More...";
    			if (!src_url_equal(img0.src, img0_src_value = "https://cdn.icon-icons.com/icons2/2699/PNG/512/minecraft_logo_icon_168974.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1w2jpi5");
    			add_location(img0, file$1, 2, 3, 55);
    			attr_dev(button0, "class", "menu-item svelte-1w2jpi5");
    			add_location(button0, file$1, 1, 2, 25);
    			if (!src_url_equal(img1.src, img1_src_value = "https://n9y2r3c6.rocketcdn.me/wp-content/uploads/2020/04/terraria-logo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-1w2jpi5");
    			add_location(img1, file$1, 7, 3, 210);
    			attr_dev(button1, "class", "menu-item svelte-1w2jpi5");
    			add_location(button1, file$1, 6, 2, 180);
    			if (!src_url_equal(img2.src, img2_src_value = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/792818ef-699f-40d1-b83e-4ba22fbac972/d6fdhno-8f879b94-02ca-4c88-bf51-e0819597ff13.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzc5MjgxOGVmLTY5OWYtNDBkMS1iODNlLTRiYTIyZmJhYzk3MlwvZDZmZGhuby04Zjg3OWI5NC0wMmNhLTRjODgtYmY1MS1lMDgxOTU5N2ZmMTMucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.KQoE9NUAIl57WGNKeSnUf0pAOculgH7ZuslANTVQsdg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-1w2jpi5");
    			add_location(img2, file$1, 12, 3, 361);
    			attr_dev(button2, "class", "menu-item svelte-1w2jpi5");
    			add_location(button2, file$1, 11, 2, 331);
    			attr_dev(button3, "class", "menu-item svelte-1w2jpi5");
    			add_location(button3, file$1, 16, 2, 968);
    			attr_dev(nav, "class", "menu svelte-1w2jpi5");
    			add_location(nav, file$1, 0, 4, 4);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, button0);
    			append_dev(button0, img0);
    			append_dev(button0, t0);
    			append_dev(nav, t1);
    			append_dev(nav, button1);
    			append_dev(button1, img1);
    			append_dev(button1, t2);
    			append_dev(nav, t3);
    			append_dev(nav, button2);
    			append_dev(button2, img2);
    			append_dev(button2, t4);
    			append_dev(nav, t5);
    			append_dev(nav, button3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.2 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[8] = list;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (347:42) 
    function create_if_block_3(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*setting*/ ctx[5].selectOf;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[4].call(select, /*each_value_1*/ ctx[8], /*setting_index_1*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*setting*/ ctx[5].value === void 0) add_render_callback(select_change_handler);
    			add_location(select, file, 347, 6, 13002);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*setting*/ ctx[5].value);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*gameSettings*/ 1) {
    				each_value_2 = /*setting*/ ctx[5].selectOf;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*gameSettings*/ 1) {
    				select_option(select, /*setting*/ ctx[5].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(347:42) ",
    		ctx
    	});

    	return block;
    }

    // (344:38) 
    function create_if_block_2(ctx) {
    	let input;
    	let t0;
    	let span;
    	let t1;
    	let t2_value = /*setting*/ ctx[5].value + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[3].call(input, /*each_value_1*/ ctx[8], /*setting_index_1*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text("(");
    			t2 = text(t2_value);
    			t3 = text(")");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-nozh0i");
    			add_location(input, file, 344, 6, 12814);
    			attr_dev(span, "class", "checkboxState svelte-nozh0i");
    			add_location(span, file, 345, 6, 12900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*setting*/ ctx[5].value);
    			input.checked = /*setting*/ ctx[5].value;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", input_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*gameSettings*/ 1) {
    				set_input_value(input, /*setting*/ ctx[5].value);
    			}

    			if (dirty & /*gameSettings*/ 1) {
    				input.checked = /*setting*/ ctx[5].value;
    			}

    			if (dirty & /*gameSettings*/ 1 && t2_value !== (t2_value = /*setting*/ ctx[5].value + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(344:38) ",
    		ctx
    	});

    	return block;
    }

    // (342:37) 
    function create_if_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[2].call(input, /*each_value_1*/ ctx[8], /*setting_index_1*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-nozh0i");
    			add_location(input, file, 342, 6, 12722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*setting*/ ctx[5].value);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*gameSettings*/ 1 && input.value !== /*setting*/ ctx[5].value) {
    				set_input_value(input, /*setting*/ ctx[5].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(342:37) ",
    		ctx
    	});

    	return block;
    }

    // (340:5) {#if setting.type == "int"}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[1].call(input, /*each_value_1*/ ctx[8], /*setting_index_1*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "svelte-nozh0i");
    			add_location(input, file, 340, 6, 12629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*setting*/ ctx[5].value);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*gameSettings*/ 1 && to_number(input.value) !== /*setting*/ ctx[5].value) {
    				set_input_value(input, /*setting*/ ctx[5].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(340:5) {#if setting.type == \\\"int\\\"}",
    		ctx
    	});

    	return block;
    }

    // (349:7) {#each setting.selectOf as additionalSetting}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*additionalSetting*/ ctx[10] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*additionalSetting*/ ctx[10];
    			option.value = option.__value;
    			add_location(option, file, 349, 8, 13099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameSettings*/ 1 && t_value !== (t_value = /*additionalSetting*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*gameSettings*/ 1 && option_value_value !== (option_value_value = /*additionalSetting*/ ctx[10])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(349:7) {#each setting.selectOf as additionalSetting}",
    		ctx
    	});

    	return block;
    }

    // (333:3) {#each gameSettings as setting}
    function create_each_block_1(ctx) {
    	let div3;
    	let div0;
    	let t0_value = /*setting*/ ctx[5].name + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3_value = /*setting*/ ctx[5].tooltip + "";
    	let t3;
    	let t4;

    	function select_block_type(ctx, dirty) {
    		if (/*setting*/ ctx[5].type == "int") return create_if_block;
    		if (/*setting*/ ctx[5].type == "str") return create_if_block_1;
    		if (/*setting*/ ctx[5].type == "bool") return create_if_block_2;
    		if (/*setting*/ ctx[5].type == "dropdown") return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(div0, "class", "settings-header svelte-nozh0i");
    			add_location(div0, file, 334, 4, 12495);
    			attr_dev(div1, "class", "settings-input svelte-nozh0i");
    			add_location(div1, file, 338, 4, 12561);
    			attr_dev(div2, "class", "settings-tooltip");
    			add_location(div2, file, 355, 4, 13220);
    			attr_dev(div3, "class", "setting svelte-nozh0i");
    			add_location(div3, file, 333, 3, 12469);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div3, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameSettings*/ 1 && t0_value !== (t0_value = /*setting*/ ctx[5].name + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}

    			if (dirty & /*gameSettings*/ 1 && t3_value !== (t3_value = /*setting*/ ctx[5].tooltip + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(333:3) {#each gameSettings as setting}",
    		ctx
    	});

    	return block;
    }

    // (365:3) {#each gameSettings as setting}
    function create_each_block(ctx) {
    	let code;
    	let t0_value = /*setting*/ ctx[5].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*setting*/ ctx[5].value + "";
    	let t2;
    	let br;

    	const block = {
    		c: function create() {
    			code = element("code");
    			t0 = text(t0_value);
    			t1 = text("=");
    			t2 = text(t2_value);
    			br = element("br");
    			attr_dev(code, "class", "svelte-nozh0i");
    			add_location(code, file, 365, 4, 13403);
    			add_location(br, file, 365, 47, 13446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, code, anchor);
    			append_dev(code, t0);
    			append_dev(code, t1);
    			append_dev(code, t2);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameSettings*/ 1 && t0_value !== (t0_value = /*setting*/ ctx[5].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*gameSettings*/ 1 && t2_value !== (t2_value = /*setting*/ ctx[5].value + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(code);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(365:3) {#each gameSettings as setting}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let h10;
    	let t2;
    	let div;
    	let t3;
    	let h11;
    	let t5;
    	let pre;
    	let current;
    	menu = new Menu({ $$inline: true });
    	let each_value_1 = /*gameSettings*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*gameSettings*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			h10 = element("h1");
    			h10.textContent = "Define your configs:";
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			h11 = element("h1");
    			h11.textContent = "Resulting config file:";
    			t5 = space();
    			pre = element("pre");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h10, "class", "svelte-nozh0i");
    			add_location(h10, file, 330, 1, 12376);
    			attr_dev(div, "class", "settings svelte-nozh0i");
    			add_location(div, file, 331, 2, 12408);
    			attr_dev(h11, "class", "svelte-nozh0i");
    			add_location(h11, file, 362, 1, 13324);
    			attr_dev(pre, "class", "svelte-nozh0i");
    			add_location(pre, file, 363, 2, 13358);
    			add_location(main, file, 327, 0, 12358);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(menu, main, null);
    			append_dev(main, t0);
    			append_dev(main, h10);
    			append_dev(main, t2);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			append_dev(main, t3);
    			append_dev(main, h11);
    			append_dev(main, t5);
    			append_dev(main, pre);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(pre, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gameSettings*/ 1) {
    				each_value_1 = /*gameSettings*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*gameSettings*/ 1) {
    				each_value = /*gameSettings*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(pre, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(menu);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let gameSettings = [
    		{
    			"name": "spawn-protection",
    			"value": 16,
    			"type": "int",
    			"tooltip": "Determines the side length of the square spawn protection area as 2x+1. Setting this to 0 disables the spawn protection. A value of 1 protects a 3×3 square centered on the spawn point. 2 protects 5×5, 3 protects 7×7, etc. This option is not generated on the first server start and appears when the first player joins. If there are no ops set on the server, the spawn protection is disabled automatically as well. "
    		},
    		{
    			"name": "max-tick-time",
    			"value": 60000,
    			"type": "int",
    			"tooltip": "The maximum number of milliseconds a single tick may take before the server watchdog stops the server with the message, A single server tick took 60.00 seconds (should be max 0.05); "
    		},
    		{
    			"name": "query-port",
    			"value": 25565,
    			"type": "int",
    			"tooltip": "Sets the port for the query server (see enable-query). "
    		},
    		{
    			"name": "generator-setting",
    			"value": "",
    			"type": "str",
    			"tooltip": "The settings used to customize world generation. Follow its format and write the corresponding JSON string. Remember to escape all : with '\:'. "
    		},
    		{
    			"name": "sync-chunk-writes",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Enables synchronous chunk writes. "
    		},
    		{
    			"name": "force-gamemode",
    			"value": false,
    			"type": "bool",
    			"tooltip": "Force players to join in the default game mode. "
    		},
    		{
    			"name": "allow-nether",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Allows players to travel to the Nether."
    		},
    		{
    			"name": "enforce-whitelist",
    			"value": false,
    			"type": "bool",
    			"tooltip": "Enforces the whitelist on the server. When this option is enabled, users who are not present on the whitelist (if it's enabled) get kicked from the server after the server reloads the whitelist file. "
    		},
    		{
    			"name": "gamemode",
    			"selectOf": ["survival", "creative", "spectator"],
    			"value": "survival",
    			"type": "dropdown",
    			"tooltip": "Defines the mode of gameplay. "
    		},
    		{
    			"name": "broadcast-console-to-ops",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Send console command outputs to all online operators."
    		},
    		{
    			"name": "enable-query",
    			"value": false,
    			"type": "bool",
    			"tooltip": "Enables GameSpy4 protocol server listener. Used to get information about server. "
    		},
    		{
    			"name": "player-idle-timeout",
    			"value": 0,
    			"type": "int",
    			"tooltip": "If non-zero, players are kicked from the server if they are idle for more than that many minutes."
    		},
    		{
    			"name": "text-filtering-config",
    			"value": "",
    			"type": "str",
    			"tooltip": "Nobody seems to know what this does."
    		},
    		{
    			"name": "difficulty",
    			"selectOf": ["peaceful", "easy", "medium", "hard"],
    			"value": "mediun",
    			"type": "dropdown",
    			"tooltip": "Defines the difficulty (such as damage dealt by mobs and the way hunger and poison affects players) of the server. "
    		},
    		{
    			"name": "broadcast-rcon-to-ops",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Send rcon console command outputs to all online operators. "
    		},
    		{
    			"name": "spawn-monsters",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Determines if monsters can spawn. "
    		},
    		{
    			"name": "op-permission-level",
    			"value": 4,
    			"type": "int",
    			"tooltip": "Sets the default permission level for ops when using /op. "
    		},
    		{
    			"name": "pvp",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Enable PvP on the server. Players shooting themselves with arrows receive damage only if PvP is enabled. "
    		},
    		{
    			"name": "entity-broadcast-range-percentage",
    			"value": 100,
    			"type": "int",
    			"tooltip": "Controls how close entities need to be before being sent to clients. Higher values means they'll be rendered from farther away, potentially causing more lag. This is expressed the percentage of the default value."
    		},
    		{
    			"name": "snooper-enabled",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Sets whether the server sends snoop data regularly to http://snoop.minecraft.net. "
    		},
    		{
    			"name": "level-type",
    			"value": "default",
    			"type": "str",
    			"tooltip": "Determines the type of map that is generated. "
    		},
    		{
    			"name": "enable-status",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Makes the server appear as 'online' on the server list. "
    		},
    		{
    			"name": "resource-pack-prompt",
    			"value": "",
    			"type": "str",
    			"tooltip": "Optional, adds a custom message to be shown on resource pack prompt when require-resource-pack is used. "
    		},
    		{
    			"name": "hardcore",
    			"value": false,
    			"type": "bool",
    			"tooltip": "If set to true, server difficulty is ignored and set to hard and players are set to spectator mode if they die. "
    		},
    		{
    			"name": "enable-command-block",
    			"value": false,
    			"type": "bool",
    			"tooltip": "Enables command blocks "
    		},
    		{
    			"name": "network-compression-threshold",
    			"value": 256,
    			"type": "int",
    			"tooltip": "By default it allows packets that are n-1 bytes big to go normally, but a packet of n bytes or more gets compressed down. So, a lower number means more compression but compressing small amounts of bytes might actually end up with a larger result than what went in. "
    		},
    		{
    			"name": "max-players",
    			"value": 20,
    			"type": "int",
    			"tooltip": "The maximum number of players that can play on the server at the same time. Note that more players on the server consume more resources. Note also, op player connections are not supposed to count against the max players, but ops currently cannot join a full server. However, this can be changed by going to the file called ops.json in the player's server directory, opening it, finding the op that the player wants to change, and changing the setting called bypassesPlayerLimit to true (the default is false). This means that that op does not have to wait for a player to leave in order to join. Extremely large values for this field result in the client-side user list being broken. "
    		},
    		{
    			"name": "max-world-size",
    			"value": 29999984,
    			"type": "int",
    			"tooltip": "This sets the maximum possible size in blocks, expressed as a radius, that the world border can obtain. Setting the world border bigger causes the commands to complete successfully but the actual border does not move past this block limit. Setting the max-world-size higher than the default doesn't appear to do anything. "
    		},
    		{
    			"name": "max-build-height",
    			"value": 256,
    			"type": "int",
    			"tooltip": "The maximum height allowed for building. Terrain may still naturally generate above a low height limit. 256 is the maximum possible, it also has to be a multiple of 8. "
    		},
    		{
    			"name": "resource-pack-sha1",
    			"value": "",
    			"type": "str",
    			"tooltip": "Optional SHA-1 digest of the resource pack, in lowercase hexadecimal. It is recommended to specify this, because it is used to verify the integrity of the resource pack. "
    		},
    		{
    			"name": "function-permission-level",
    			"value": 2,
    			"type": "int",
    			"tooltip": "Sets the default permission level for functions. "
    		},
    		{
    			"name": "rcon.port",
    			"value": 25575,
    			"type": "int",
    			"tooltip": "Sets the RCON network port. "
    		},
    		{
    			"name": "server-port",
    			"value": 25565,
    			"type": "int",
    			"tooltip": "Changes the port the server is hosting (listening) on. This port must be forwarded if the server is hosted in a network using NAT (if the player has a home router/firewall). "
    		},
    		{
    			"name": "server-ip",
    			"value": "",
    			"type": "str",
    			"tooltip": "The player should set this if they want the server to bind to a particular IP. It is strongly recommended that the player leaves server-ip blank. Set to blank, or the IP the player want their server to run (listen) on."
    		},
    		{
    			"name": "spawn-npcs",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Determines whether villagers can spawn. "
    		},
    		{
    			"name": "require-resource-pack",
    			"value": false,
    			"type": "bool",
    			"tooltip": "When this option is enabled (set to true), players will be prompted for a response and will be disconnected if they decline the required pack. "
    		},
    		{
    			"name": "allow-flight",
    			"value": false,
    			"type": "bool",
    			"tooltip": "Allows users to use flight on the server while in Survival mode, if they have a mod that provides flight installed."
    		},
    		{
    			"name": "level-name",
    			"value": "world",
    			"type": "str",
    			"tooltip": "The 'level-name' value is used as the world name and its folder name. The player may also copy their saved game folder here, and change the name to the same as that folder's to load it instead. "
    		},
    		{
    			"name": "view-distance",
    			"value": 10,
    			"type": "int",
    			"tooltip": "Sets the amount of world data the server sends the client, measured in chunks in each direction of the player (radius, not diameter). It determines the server-side viewing distance. "
    		},
    		{
    			"name": "resource-pack",
    			"value": "",
    			"type": "str",
    			"tooltip": "Optional URI to a resource pack. The player may choose to use it. "
    		},
    		{
    			"name": "spawn-animals",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Determines if animals can spawn. "
    		},
    		{
    			"name": "white-list",
    			"type": false,
    			"type": "bool",
    			"tooltip": "Enables a whitelist on the server. With a whitelist enabled, users not on the whitelist cannot connect. Intended for private servers, such as those for real-life friends or strangers carefully selected via an application process, for example. "
    		},
    		{
    			"name": "rcon.password",
    			"value": "",
    			"type": "str",
    			"tooltip": "Sets the password for RCON: a remote console protocol that can allow other applications to connect and interact with a Minecraft server over the internet. "
    		},
    		{
    			"name": "generate-structures",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Defines whether structures (such as villages) can be generated. Note: Dungeons will still be generated, even if set to false."
    		},
    		{
    			"name": "online-mode",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Server checks connecting players against Minecraft account database. Set this to false only if the player's server is not connected to the Internet. Hackers with fake accounts can connect if this is set to false! If minecraft.net is down or inaccessible, no players can connect if this is set to true. Setting this variable to off purposely is called 'cracking' a server, and servers that are present with online mode off are called 'cracked' servers, allowing players with unlicensed copies of Minecraft to join. "
    		},
    		{
    			"name": "level-seed",
    			"value": "",
    			"type": "str",
    			"tooltip": "Sets a world seed for the player's world, as in Singleplayer. The world generates with a random seed if left blank. "
    		},
    		{
    			"name": "prevent-proxy-connections",
    			"value": false,
    			"type": "bool",
    			"tooltip": "If the ISP/AS sent from the server is different from the one from Mojang Studios' authentication server, the player is kicked "
    		},
    		{
    			"name": "use-native-transport",
    			"value": true,
    			"type": "bool",
    			"tooltip": "Linux server performance improvements: optimized packet sending/receiving on Linux "
    		},
    		{
    			"name": "enable-jmx-monitoring",
    			"value": false,
    			"type": "bool",
    			"tooltip": "Exposes an MBean with the Object name net.minecraft.server:type=Server and two attributes averageTickTime and tickTimes exposing the tick times in milliseconds. "
    		},
    		{
    			"name": "motd",
    			"value": "A Minecraft Server",
    			"type": "str",
    			"tooltip": "This is the message that is displayed in the server list of the client, below the name. "
    		},
    		{
    			"name": "rate-limit",
    			"value": 0,
    			"type": "int",
    			"tooltip": "Sets the maximum amount of packets a user can send before getting kicked. Setting to 0 disables this feature. "
    		},
    		{
    			"name": "enable-rcon",
    			"value": false,
    			"type": "bool",
    			"tooltip": "Enables remote access to the server console. "
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(each_value_1, setting_index_1) {
    		each_value_1[setting_index_1].value = to_number(this.value);
    		$$invalidate(0, gameSettings);
    	}

    	function input_input_handler_1(each_value_1, setting_index_1) {
    		each_value_1[setting_index_1].value = this.value;
    		$$invalidate(0, gameSettings);
    	}

    	function input_change_handler(each_value_1, setting_index_1) {
    		each_value_1[setting_index_1].value = this.value;
    		each_value_1[setting_index_1].value = this.checked;
    		$$invalidate(0, gameSettings);
    	}

    	function select_change_handler(each_value_1, setting_index_1) {
    		each_value_1[setting_index_1].value = select_value(this);
    		$$invalidate(0, gameSettings);
    	}

    	$$self.$capture_state = () => ({ Menu, gameSettings });

    	$$self.$inject_state = $$props => {
    		if ('gameSettings' in $$props) $$invalidate(0, gameSettings = $$props.gameSettings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		gameSettings,
    		input_input_handler,
    		input_input_handler_1,
    		input_change_handler,
    		select_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

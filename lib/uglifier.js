function comments(option) {
  if (Object.prototype.toString.call(option) === '[object Array]') {
    return new RegExp(option[0], option[1]);
  } else if (option == "jsdoc") {
    return function(node, comment) {
      if (comment.type == "comment2") {
        return /@preserve|@license|@cc_on/i.test(comment.value);
      } else {
        return false;
      }
    }
  } else {
    return option;
  }
}

function parse(source, options) {
  var ast = UglifyJS.parse(source, options.parse_options);
  ast.figure_out_scope();

  if (options.compress) {
    var compressor = UglifyJS.Compressor(options.compress);
    ast = ast.transform(compressor);
    ast.figure_out_scope();
  }

  if (options.mangle) {
    ast.compute_char_frequency();
    ast.mangle_names(options.mangle);
  }

  if (options.enclose) {
    ast = ast.wrap_enclose(options.enclose);
  }
  return ast;
}

function uglifier(options) {
  var source = options.source;
  var ast = parse(source, options);

  var gen_code_options = options.output;
  gen_code_options.comments = comments(options.output.comments);

  if (options.generate_map) {
      var source_map = UglifyJS.SourceMap(options.source_map_options);
      gen_code_options.source_map = source_map;
  }

  var stream = UglifyJS.OutputStream(gen_code_options);
  ast.print(stream);

  if (options.source_map_options.map_url) {
    stream += "\n//# sourceMappingURL=" + options.source_map_options.map_url;
  }

  if (options.source_map_options.url) {
    stream += "\n//# sourceURL=" + options.source_map_options.url;
  }

  if (options.generate_map) {
      return [stream.toString(), source_map.toString()];
  } else {
      return stream.toString();
  }
}

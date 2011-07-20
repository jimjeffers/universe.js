beforeEach( ->
  this.addMatchers(
    toBeAnInstanceOf: (param) ->
      current = this.actual
      current instanceof param
  )
)
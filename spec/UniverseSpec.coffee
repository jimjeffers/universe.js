describe("Universe", ->
  universe = null
  
  beforeEach( ->
    universe = new Universe();
  )
  
  it("should exist!", ->
    expect(universe?).toBeTruthy()
  )
  
  it("should be a universe", ->
    expect(universe).toBeAnInstanceOf(Universe)
  )
)